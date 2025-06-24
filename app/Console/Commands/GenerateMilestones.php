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
            $oneMonthLater = now()->addMonth();

            $users = UsersModel::all();

            foreach ($users as $user) {
                $todayDateString = $today->toDateString();

                // 🎂 Birthday within 1 month range
                if ($user->birth_date) {
                    $nextBirthday = $user->birth_date
                        ->copy()
                        ->year($today->year);

                    // Handle birthdays already passed this year
                    if ($nextBirthday->lessThan($today)) {
                        $nextBirthday->addYear();
                    }

                    if ($nextBirthday->between($today, $oneMonthLater)) {
                        Milestone::firstOrCreate([
                            'user_id' => $user->id,
                            'type' => 'birthday',
                            'date' => $nextBirthday->toDateString(),
                            'description' => "Happy upcoming Birthday! {$user->name}",
                            'client_id' => $user->client_id,
                        ]);

                        Log::info(
                            "Upcoming birthday milestone created for {$user->name}"
                        );
                    }
                }

                // 🥳 Work Anniversary within 1 month range
                if ($user->date_start) {
                    $nextAnniversary = $user->date_start
                        ->copy()
                        ->year($today->year);
                    if ($nextAnniversary->lessThan($today)) {
                        $nextAnniversary->addYear();
                    }

                    if ($nextAnniversary->between($today, $oneMonthLater)) {
                        $years =
                            $nextAnniversary->year - $user->date_start->year;

                        Milestone::firstOrCreate([
                            'user_id' => $user->id,
                            'type' => 'anniversary',
                            'date' => $nextAnniversary->toDateString(),
                            'description' => "$years Year Work Anniversary",
                            'client_id' => $user->client_id,
                        ]);

                        Log::info(
                            "Upcoming anniversary milestone created for {$user->name}"
                        );
                    }
                }

                // 📆 Monthsary within next month range (exact date)
                if ($user->date_start) {
                    $monthsSinceStart = $user->date_start->diffInMonths($today);

                    if ($monthsSinceStart > 0) {
                        $nextMonthsary = $user->date_start
                            ->copy()
                            ->addMonths($monthsSinceStart + 1);

                        if ($nextMonthsary->between($today, $oneMonthLater)) {
                            $totalMonths = $monthsSinceStart + 1;
                            $years = intdiv($totalMonths, 12);
                            $months = $totalMonths % 12;

                            $descriptionParts = [];
                            if ($years > 0) {
                                $descriptionParts[] =
                                    $years . ' yr' . ($years > 1 ? 's' : '');
                            }
                            if ($months > 0) {
                                $descriptionParts[] =
                                    $months .
                                    ' month' .
                                    ($months > 1 ? 's' : '');
                            }

                            $description =
                                implode(' and ', $descriptionParts) . ' Work';

                            Milestone::firstOrCreate([
                                'user_id' => $user->id,
                                'type' => 'monthsary',
                                'date' => $nextMonthsary->toDateString(),
                                'description' => $description,
                                'client_id' => $user->client_id,
                            ]);

                            Log::info(
                                "Upcoming monthsary milestone created for {$user->name}: {$description}"
                            );
                        }
                    }
                }
            }
        } catch (\Throwable $th) {
            Log::error($th->getMessage());
            Log::error($th->getTraceAsString());
        }
    }
}
