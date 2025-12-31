import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Syncs Auth.js user data to our custom User model
 * Called after successful authentication to ensure data consistency
 */
export async function syncUserFromAuth(
    email: string,
    name: string | null,
    image: string | null,
    googleId: string | null
): Promise<void> {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            // Update existing user with latest data
            // Sync both image (for Auth.js) and profileImage (for our app)
            const updateData: any = {
                name: name || existingUser.name,
                profileImage: image || existingUser.profileImage,
                googleId: googleId || existingUser.googleId,
            };

            // Add image field if it exists in the schema
            if (image !== null) {
                updateData.image = image;
            }

            await prisma.user.update({
                where: { id: existingUser.id },
                data: updateData,
            });
        } else {
            // This shouldn't happen as Auth.js creates the user first via PrismaAdapter
            // But if it does, create with both image fields
            const createData: any = {
                email,
                name,
                profileImage: image,
                googleId,
            };

            // Add image field if provided
            if (image !== null) {
                createData.image = image;
            }

            await prisma.user.create({
                data: createData,
                // No UserLevelStatus entries created - this represents null state
            });
        }
    } catch (error) {
        console.error('Error syncing user:', error);
        throw error;
    }
}

