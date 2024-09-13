import MealsGrid from '@/components/meals/meals-grid';
import classes from './page.module.css';
import Link from 'next/link';
import { getMeals } from '@/lib/meals';
import { Suspense } from 'react';

export const metadata = {
    title: 'All Meals',
    description: 'Browse the Delicious meals shared by our community.',
  };

async function Meals(){
    const meals = await getMeals();
    return (
        <MealsGrid meals = {meals} />
    )
}


export default async function MealsPage() {
    const meals = await getMeals()
    return(
    <>
    <header className={classes.header}> 
        <h1>
            Delicious meal, created <span className={classes.highlight}>
                by you
            </span>
        </h1>
        <p> Choose your fav recipe and cook!!</p>
        <p className={classes.cta}>
            <Link href='/meals/share'>
                Share your recipe!
            </Link>
        </p>
    </header>
    <main className={classes.main}>
        <Suspense fallback={<p className={classes.loading}>Fetching your fav meals...</p>}>
          <Meals/>
        </Suspense>
    </main>
    </>
    )
}