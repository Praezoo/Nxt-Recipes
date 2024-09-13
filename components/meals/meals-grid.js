import MealItem from './meal-item'
import classes from './meals-grid.module.css'
export default function MealsGrid({ meals = [] }) {  // Default to an empty array if meals is undefined
    if (!meals.length) {
        return <p>No meals available.</p>;  // Handle empty state gracefully
    }
    return (
        <ul className={classes.meals}>
            {meals.map((meal) => (
                <li key={meal.id}>
                    <MealItem {...meal} />
                </li>
            ))}
        </ul>
    );
}