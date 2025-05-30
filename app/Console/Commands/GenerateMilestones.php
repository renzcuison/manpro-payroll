<?php

namespace App\Console\Commands;

use App\Models\Milestone;
use App\Models\UsersModel;
use Illuminate\Console\Command;

class GenerateMilestones extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'generate:milestones';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate employee milestones';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $today = now()->toDateString();
        
        $users = UsersModel::all();
        foreach ($users as $user) {
            // Birthday
            if ($user->birth_date && $user->birth_date->format('m-d') == now()->format('m-d')) {
                Milestone::firstOrCreate([
                    'user_id' => $user->id,
                    'type' => 'birthday',
                    'date' => $today,
                    'client_id' =>$user->client_id,
                ]);
            }

            // Work Anniversary
            if ($user->date_start && $user->date_start->format('m-d') == now()->format('m-d')) {
                $years = now()->year - $user->date_start->year;
                Milestone::firstOrCreate([
                    'user_id' => $user->id,
                    'type' => 'anniversary',
                    'date' => $today,
                    'description' => "$years Year Work Anniversary",
                    'client_id' =>$user->client_id,
                ]);
            }
        }
    }
}