<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\ListModel;
use App\Models\Status;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'task_name' => $this->faker->name(),
            'task_status_id' => Status::inRandomOrder()->first(),
            'task_list_id' => ListModel::inRandomOrder()->first(),
            'task_created_by' => 1,
            'task_date_created' => $this->faker->dateTime(),
            'task_contact' => Contact::inRandomOrder()->first(),
            'task_assign_to' => User::inRandomOrder()->first()
        ];
    }
}
