<?php

namespace App\Console\Commands;

use App\Models\Milestone;
use App\Models\UsersModel;
use App\Notifications\MilestoneReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

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
        try {
            $today = now();
            $targetDate = now()->addMonth(); // Check 1 month in advance
            $targetMonthDay = $targetDate->format('m-d');

            $users = UsersModel::all();

            foreach ($users as $user) {
                $todayDateString = $today->toDateString();
                // Birthday check 1 month ahead
                if (
                    $user->birth_date &&
                    $user->birth_date->format('m-d') === $targetMonthDay
                ) {
                    $milestoneDate = now()
                        ->addMonth()
                        ->toDateString();

                    $milestone = Milestone::firstOrCreate([
                        'user_id' => $user->id,
                        'type' => 'birthday',
                        'date' => $milestoneDate,
                        'description' => "Happy Birthday! {$user->name} 1 month ahead of your birthday",
                        'client_id' => $user->client_id,
                    ]);

                    // $user->notify(
                    //     new MilestoneReminder('Birthday', $milestoneDate)
                    // );
                    Log::info($milestone);
                }

                // Anniversary check 1 month ahead
                if (
                    $user->date_start &&
                    $user->date_start->format('m-d') === $targetMonthDay
                ) {
                    $years = $targetDate->year - $user->date_start->year;
                    $milestoneDate = now()
                        ->addMonth()
                        ->toDateString();

                    $milestone = Milestone::firstOrCreate([
                        'user_id' => $user->id,
                        'type' => 'anniversary',
                        'date' => $milestoneDate,
                        'description' => "$years Year Work Anniversary",
                        'client_id' => $user->client_id,
                    ]);

                    // $user->notify(
                    //     new MilestoneReminder(
                    //         'Work Anniversary',
                    //         $milestoneDate
                    //     )
                    // );
                    Log::info($milestone);
                }

                // 🗓️ Work Monthsary (triggered today)
                if (
                    $user->date_start &&
                    $user->date_start->format('d') === $today->format('d')
                ) {
                    $monthsSinceStart = $user->date_start->diffInMonths($today);

                    if ($monthsSinceStart > 0) {
                        Milestone::firstOrCreate([
                            'user_id' => $user->id,
                            'type' => 'monthsary',
                            'date' => $todayDateString,
                            'description' => "$monthsSinceStart Month Work",
                            'client_id' => $user->client_id,
                        ]);

                        // $user->notify(
                        //     new MilestoneReminder(
                        //         'Work Monthsary',
                        //         $todayDateString
                        //     )
                        // );
                    }
                }
            }
        } catch (\Throwable $th) {
            Log::error($th->getMessage());
            Log::error($th->getTraceAsString());
        }
    }
}