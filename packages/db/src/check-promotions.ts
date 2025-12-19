import { db } from "./index";
import { promotions, hotels } from "./schema";
import { eq } from "drizzle-orm";

async function checkPromotions() {
    console.log("Checking promotions in database...\n");

    const allPromotions = await db.query.promotions.findMany({
        with: {
            hotel: {
                columns: {
                    name: true,
                    id: true,
                }
            }
        }
    });

    console.log(`Found ${allPromotions.length} promotions:\n`);

    allPromotions.forEach((promo: typeof allPromotions[number]) => {
        console.log(`Hotel: ${promo.hotel?.name || 'N/A'}`);
        console.log(`Code: ${promo.code}`);
        console.log(`Name: ${promo.name}`);
        console.log(`Type: ${promo.type}`);
        console.log(`Value: ${promo.value}`);
        console.log(`Active: ${promo.isActive}`);
        console.log(`Updated: ${promo.updatedAt}`);
        console.log('---\n');
    });
}

checkPromotions()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });
