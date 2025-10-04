"""
Migration script to remove 'role' field from existing user documents in Firestore.
This script updates all user documents to remove the deprecated 'role' field.

Run this script after updating the backend code to remove role-based registration.

Usage:
    python migrate_remove_role.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def init_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
        print("✅ Firebase already initialized")
    except ValueError:
        # Initialize Firebase
        project_id = os.getenv("FIREBASE_PROJECT_ID")

        if not project_id:
            print("❌ Error: FIREBASE_PROJECT_ID not found in .env file")
            return None

        # For local development with service account
        service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")

        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(
                cred,
                {
                    "projectId": project_id,
                },
            )
            print(f"✅ Firebase initialized with service account")
        else:
            # Initialize with project ID only (uses default credentials)
            firebase_admin.initialize_app(
                options={
                    "projectId": project_id,
                }
            )
            print(f"✅ Firebase initialized with project ID: {project_id}")

    return firestore.client()


def migrate_users():
    """Remove 'role' field from all user documents"""
    db = init_firebase()

    if not db:
        print("❌ Failed to initialize Firestore")
        return

    print("\n" + "=" * 60)
    print("🔄 Starting migration: Remove 'role' field from users")
    print("=" * 60 + "\n")

    try:
        # Get all users
        users_ref = db.collection("users")
        users = users_ref.stream()

        total_users = 0
        updated_users = 0
        skipped_users = 0

        for user_doc in users:
            total_users += 1
            user_data = user_doc.to_dict()
            user_id = user_doc.id

            # Check if user has 'role' field
            if "role" in user_data:
                role_value = user_data["role"]
                print(f"📝 User {user_id[:8]}... has role: {role_value}")

                # Remove the role field
                try:
                    users_ref.document(user_id).update({"role": firestore.DELETE_FIELD})
                    print(f"   ✅ Removed role field")
                    updated_users += 1
                except Exception as e:
                    print(f"   ❌ Error updating user: {str(e)}")
            else:
                print(f"⏭️  User {user_id[:8]}... already migrated (no role field)")
                skipped_users += 1

        print("\n" + "=" * 60)
        print("📊 Migration Summary:")
        print("=" * 60)
        print(f"Total users processed:  {total_users}")
        print(f"Users updated:          {updated_users}")
        print(f"Users skipped:          {skipped_users}")
        print("=" * 60 + "\n")

        if updated_users > 0:
            print("✅ Migration completed successfully!")
            print("\n💡 Tip: You can now restart your backend server.")
        elif total_users == 0:
            print("⚠️  No users found in the database.")
        else:
            print("✅ All users already migrated!")

    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        import traceback

        traceback.print_exc()


def verify_migration():
    """Verify that no users have 'role' field"""
    db = init_firebase()

    if not db:
        print("❌ Failed to initialize Firestore")
        return

    print("\n" + "=" * 60)
    print("🔍 Verifying migration...")
    print("=" * 60 + "\n")

    try:
        users_ref = db.collection("users")
        users = users_ref.stream()

        users_with_role = []
        total_users = 0

        for user_doc in users:
            total_users += 1
            user_data = user_doc.to_dict()

            if "role" in user_data:
                users_with_role.append(user_doc.id)

        if users_with_role:
            print(f"⚠️  Found {len(users_with_role)} users still with 'role' field:")
            for user_id in users_with_role:
                print(f"   - {user_id}")
            print("\n💡 Run the migration again to fix these users.")
        else:
            print(f"✅ Verification passed!")
            print(f"   All {total_users} users have been migrated successfully.")
            print("   No 'role' fields found in any user documents.")

    except Exception as e:
        print(f"\n❌ Verification failed: {str(e)}")


def show_user_info():
    """Show information about a specific user"""
    db = init_firebase()

    if not db:
        print("❌ Failed to initialize Firestore")
        return

    user_id = input("\nEnter user ID to inspect: ").strip()

    if not user_id:
        print("❌ No user ID provided")
        return

    try:
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            print(f"❌ User {user_id} not found")
            return

        user_data = user_doc.to_dict()

        print("\n" + "=" * 60)
        print(f"👤 User Information: {user_id}")
        print("=" * 60)

        for key, value in user_data.items():
            if key == "role":
                print(f"⚠️  {key}: {value} (DEPRECATED - should be removed)")
            else:
                print(f"   {key}: {value}")

        print("=" * 60 + "\n")

    except Exception as e:
        print(f"❌ Error fetching user: {str(e)}")


def main():
    """Main function"""
    print("""
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   RideFront User Migration Tool                           ║
║   Remove 'role' field from user documents                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    """)

    while True:
        print("\nWhat would you like to do?")
        print("  1. Run migration (remove 'role' from all users)")
        print("  2. Verify migration")
        print("  3. Inspect specific user")
        print("  4. Exit")

        choice = input("\nEnter your choice (1-4): ").strip()

        if choice == "1":
            confirm = input(
                "\n⚠️  This will remove 'role' field from all users. Continue? (yes/no): "
            )
            if confirm.lower() in ["yes", "y"]:
                migrate_users()
            else:
                print("❌ Migration cancelled")

        elif choice == "2":
            verify_migration()

        elif choice == "3":
            show_user_info()

        elif choice == "4":
            print("\n👋 Goodbye!")
            break

        else:
            print("❌ Invalid choice. Please enter 1-4.")


if __name__ == "__main__":
    main()
