<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

class DailyTaskDueNotification extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'daily:notification';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send daily email notification for tasks due';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        
        $dateToday = Carbon::today()->toDateString();
        // get all users assigned in tasks with dues.
        $usersWithDueTasks = User::join('tbl_task_due_get_notified', 'tbl_task_due_get_notified.user_id', '=', 'user.user_id')
            ->join('task', 'task.task_assign_to', 'LIKE', DB::raw("CONCAT('%,', user.user_id, ',%')"))
            ->where('task.task_due_date', $dateToday)
            ->groupBy('user.user_id')
            ->get(['user.*']);

        foreach ($usersWithDueTasks as $user) {
            Mail::send('mail.task_due_notification', ['user' => $user], function ($message) use ($user) {
                $message->to($user->email)->subject('Task Due Today Reminder');
            });
        }
        
        $this->info('Daily notifications sent successfully!');       
    }
}