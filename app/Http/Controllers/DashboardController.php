<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Task;
use App\Models\Contact;
use App\Models\Referral;
use App\Models\ScheduledCall;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getTotals(Request $request)
    {
		$user = $request->user();
        $user_id = $user->user_id;
        $assign = 0;
        $finish = 0;
        $unfinish = 0;

        // total users
        $total_user = User::all()->count();
        
        // total contact created
        $total_contact_created = Contact::where('contact_created_by', $user_id)
        ->whereDate('contact_date_created',date('Y-m-d'))
        // ->get();
        ->count();
        // ->toSql();

        // dd($total_contact_created);
        

        // Total tasks
        $total_tasks = Task::all()->count();

        // Total Due Tasks
        $total_due_tasks = Task::where('task_due_date', 'LIKE', date('Y-m-d'))->count();
        // dd($total_due_tasks);

        // Total assigned tasks
        $total_assigned_tasks_all = Task::where('task_assign_to', 'LIKE', '%'.$user_id.'%')->get();
        foreach($total_assigned_tasks_all as $total_assigned_tasks){
            $str_to_array = explode(",", $total_assigned_tasks['task_assign_to']);
            if (in_array($user_id, $str_to_array)) {
                $assign++; // count total assigned tasks
                $list_id = $total_assigned_tasks['task_list_id']; // get list id
                $fetch_list_status = DB::table('status')->select('status_id')->where('status_list_id', $list_id)->orderByDesc('status_order_no')->first();
                $status_id = $fetch_list_status->status_id;
                if ($status_id == $total_assigned_tasks['task_status_id']) // identify if task is done
                {
                    $finish++;
                }
                else{
                    $unfinish++;
                }
            }
        }
        // total contact count
        $total_contact = Contact::all()->count();

        // total referrals
        $total_referrals = Contact::join('tbl_referrals','tbl_referrals.contact_id','=', 'contact.contact_id')->count();

        // total inquiry contacts
        $total_inquiry_contacts = Contact::whereNull('contact_assign_to')->where('is_removed', 0)->count();

        // total scheduled calls
        $total_scheduled_calls = ScheduledCall::whereDate('start_date',date('Y-m-d'))->count();

        return [
            'total_user' => $total_user,
            'total_tasks' => $total_tasks,
            'total_due_tasks' => $total_due_tasks,
            'total_contact' => $total_contact,
            'total_assigned_tasks' => $assign,
            'total_contact_created' => $total_contact_created,
            'finished_tasks' =>$finish,
            'unfinish' => $unfinish,
            'total_referrals' => $total_referrals,
            'total_inquiry_contacts' => $total_inquiry_contacts,
            'total_scheduled_calls' => $total_scheduled_calls
        ];
    }
    
    public function getAssignedTasks(Request $request)
    {

		$user = $request->user();
        $user_id = $user->user_id;
        $assigned_tasks = [];
        $total_due_dates_today= 0;

        $tasks = DB::table('task')
                    ->join('list','list.list_id', '=', 'task.task_list_id')
                    ->join('space', 'space.space_id', '=', 'list.list_space_id')
                    ->join('status', 'status.status_id', '=', 'task.task_status_id')
                    ->select('task.*', 'space.space_name', 'list.list_name', 'status.status_color', 'status.status_name')
                    // ->toSql();
                    ->get();
                    // dd($tasks);

        foreach($tasks as $task){

            $str_to_array = explode(",", $task->task_assign_to);

            if (in_array($user_id, $str_to_array)) {

                // $due_date = Carbon::createFromFormat('Y-m-d H:i:s', '2021-01-02 11:10:00');
                $due_today = false;
                if ($task->task_due_date && $task->task_due_date == Carbon::now()->toDateString()) {
                    $total_due_dates_today++;
                    $due_today = true;
                }

                array_push($assigned_tasks,[
                    'task_id' => $task->task_id,
                    'task_status' => $task->task_status_id,
                    'task_list_id' => $task->task_list_id,
                    'task_name' => $task->task_name,
                    'tags' => $task->task_tag,
                    'due_date' => $task->task_due_date,
                    'due_today' => $due_today,
                    'priority' => $task->task_priority,
                    'service' => $task->space_name,
                    'list' => $task->list_name,
                    'status' => $task->status_name,
                    'status_color' => $task->status_color,
                ]);

            }
        }

        return response([
            'assigned_tasks' => $assigned_tasks,
            'total_due_dates' => $total_due_dates_today
        ]);
    }
}
