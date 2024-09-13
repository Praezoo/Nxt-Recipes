import fs from "node:fs";
import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";
import { S3 } from '@aws-sdk/client-s3';
const s3 = new S3({
    region: 'eu-north-1'
  });

const db = sql("meals.db");

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // throw new Error('Failed loading your meals');
  return db.prepare("SELECT * FROM meals").all();
}
export function getMeal(slug) {
  return db.prepare("SELECT * FROM meals WHERE slug = ?").get(slug);
}
// export async function saveMeal(meal) {
//   meal.slug = slugify(meal.title, { lower: true });
//   meal.instructions = xss(meal.instructions);
//   const extension = meal.image.name.split(".").pop();
//   const fileName = `${meal.slug}.${extension}`;

//   const stream = fs.createWriteStream(`public/images/${fileName}`);
//   const bufferedImage = await meal.image.arrayBuffer();

//   stream.write(Buffer.from(bufferedImage), (error) => {
//     if (error) {
//       throw new Error("Image could not be saved.");
//     }
//   });
//   meal.image = `/images/${fileName}`;

//   db.prepare(
//     `
//         INSERT INTO meals
//         (title,summary,instructions,creator,creator_email,image,slug)
//         VALUES (
//         @title,
//         @summary,
//         @instructions,
//         @creator,
//         @creator_email,
//         @image,
//         @slug
//         )
//         `
//   ).run(meal);
// }


export async function saveMeal(meal) {
  // Create a slug for the meal based on the title
  meal.slug = slugify(meal.title, { lower: true });
  
  // Sanitize the meal instructions to prevent XSS attacks
  meal.instructions = xss(meal.instructions);

  // Ensure the slug is unique by checking the database
  let existingMeal = db.prepare("SELECT slug FROM meals WHERE slug = ?").get(meal.slug);
  let counter = 1;

  while (existingMeal) {
    // Append a number to the slug if it already exists
    meal.slug = `${slugify(meal.title, { lower: true })}-${counter}`;
    existingMeal = db.prepare("SELECT slug FROM meals WHERE slug = ?").get(meal.slug);
    counter++;
  }

  // Extract the file extension from the image name
  const extension = meal.image.name.split(".").pop();
  const fileName = `${meal.slug}.${extension}`;

  // Upload the image to S3
  const bufferedImage = await meal.image.arrayBuffer();

  await s3.putObject({
    Bucket: 'prajwal-nextjs-demo-users-image', // Replace with your S3 bucket name
    Key: fileName,
    Body: Buffer.from(bufferedImage),
    ContentType: meal.image.type, // Ensure the content type matches the image file
  });

  // Save the file name (not the path) to the database
  meal.image = fileName;

  // Insert the meal data into the database
  db.prepare(
    `
    INSERT INTO meals
      (title, summary, instructions, creator, creator_email, image, slug)
    VALUES (
      @title,
      @summary,
      @instructions,
      @creator,
      @creator_email,
      @image,
      @slug
    )
    `
  ).run(meal);
}

