<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ContactFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'contact_fname' => $this->faker->firstName(),
            'contact_mname' => $this->faker->lastName(),
            'contact_lname' => $this->faker->lastName(),
            'contact_bdate' => $this->faker->dateTimeThisMonth(),
            'contact_gender' => $this->faker->randomElement(['Male','Female']),
            'contact_email' => $this->faker->unique()->safeEmail(),
            'username' => $this->faker->unique()->userName(),
            'contact_password' => 'password',
            'contact_cpnum' => $this->faker->phoneNumber(),
            'contact_date_created' => $this->faker->dateTime(),
        ];
    }
}
