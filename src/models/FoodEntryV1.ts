export default class FoodEntryV1 {
  foodName: string;

  mealType: string;

  amount: number;

  unit: string;

  date: string;

  nutrition: {
    calories: number;

    carbohydrates: number;

    cholesterol: number;

    fat: number;

    fiber: number;

    protein: number;

    sodium: number;

    sugars: number;
  };
}
