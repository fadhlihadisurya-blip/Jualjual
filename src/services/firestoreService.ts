import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Material, Product, SaleTransaction } from '../types';

// Real-time listener for user's Materials
export function subscribeToUserMaterials(
  userId: string,
  onData: (materials: Material[]) => void
): Unsubscribe {
  const path = `users/${userId}/materials`;
  return onSnapshot(
    collection(db, 'users', userId, 'materials'),
    (snapshot) => {
      const items: Material[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Material);
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Real-time listener for user's Products
export function subscribeToUserProducts(
  userId: string,
  onData: (products: Product[]) => void
): Unsubscribe {
  const path = `users/${userId}/products`;
  return onSnapshot(
    collection(db, 'users', userId, 'products'),
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Product);
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Real-time listener for user's Transactions
export function subscribeToUserTransactions(
  userId: string,
  onData: (transactions: SaleTransaction[]) => void
): Unsubscribe {
  const path = `users/${userId}/transactions`;
  return onSnapshot(
    collection(db, 'users', userId, 'transactions'),
    (snapshot) => {
      const items: SaleTransaction[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as SaleTransaction);
      });
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// Save or update a material for this specific user
export async function saveUserMaterial(userId: string, material: Material): Promise<void> {
  const path = `users/${userId}/materials/${material.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'materials', material.id), material);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete a material for this user
export async function deleteUserMaterial(userId: string, materialId: string): Promise<void> {
  const path = `users/${userId}/materials/${materialId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'materials', materialId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save or update a product for this user
export async function saveUserProduct(userId: string, product: Product): Promise<void> {
  const path = `users/${userId}/products/${product.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'products', product.id), product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete a product for this user
export async function deleteUserProduct(userId: string, productId: string): Promise<void> {
  const path = `users/${userId}/products/${productId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save a sale transaction and update deducted materials in batch for this user
export async function saveUserSaleTransaction(
  userId: string,
  transaction: SaleTransaction,
  updatedMaterials: Material[]
): Promise<void> {
  const path = `users/${userId}/transactions/${transaction.id}`;
  try {
    const batch = writeBatch(db);
    
    // 1. Write the transaction
    const trxRef = doc(db, 'users', userId, 'transactions', transaction.id);
    batch.set(trxRef, transaction);

    // 2. Write updated materials
    for (const mat of updatedMaterials) {
      const matRef = doc(db, 'users', userId, 'materials', mat.id);
      batch.set(matRef, mat);
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Check and seed initial template for a new user once in Firestore
export async function checkAndInitializeUserData(
  userId: string,
  email: string,
  initialMaterials: Material[],
  initialProducts: Product[]
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists() || !snap.data()?.initialized) {
      const batch = writeBatch(db);
      batch.set(
        userRef,
        {
          uid: userId,
          email,
          initialized: true,
          createdAt: new Date().toISOString()
        },
        { merge: true }
      );

      for (const m of initialMaterials) {
        batch.set(doc(db, 'users', userId, 'materials', m.id), m);
      }
      for (const p of initialProducts) {
        batch.set(doc(db, 'users', userId, 'products', p.id), p);
      }
      await batch.commit();
    }
  } catch (error) {
    console.error('Initializing user store failed:', error);
  }
}

// Save user profile metadata
export async function saveUserProfile(userId: string, email: string): Promise<void> {
  try {
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      email,
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Saving user profile skipped:', error);
  }
}

