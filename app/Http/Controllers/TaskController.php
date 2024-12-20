<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use App\Models\Task;
use App\Models\TaskTag;
use App\Models\User;
use App\Models\Contact;
use App\Models\Status;
use Carbon\Carbon;

class TaskController extends Controller
{
    public function index()
    {
        return view('tasks.index');
    }

    public function create(Task $task)
    {
        $this->authorize('create', [Task::class, $task]);

        $task = new Task();

        if ($task->user()->cannot('update', [$task])) {
            abort(403);
        }
    }

    // create show function
    public function show($task_id)
    {

        $task = Task::join('status', 'task.task_status_id', '=', 'status.status_id')
            ->join('list', 'task.task_list_id', '=', 'list.list_id')
            ->select('task.*', 'status.status_id', 'status.status_name', 'status.status_order_no', 'status.status_color', 'list.list_name')
            ->where('task.task_id', $task_id)
            ->first();

        if ($task) {
            $creator = User::find($task->task_created_by);
            return response([
                'data' => $task,
                'creator' => $creator
            ]);
        }
        return response([]);
    }

    public function getAllUsersWithDueTasks()
    {
        $dateToday = Carbon::today()->toDateString();
        // get all users assigned in tasks with dues.
        $tasksWithDue = Task::where('task_due_date', $dateToday)
            ->select('task_assign_to', 'task_name')
            ->get();

        // Get unique user IDs assigned to tasks with due date today
        $users_id = $tasksWithDue->pluck('task_assign_to')
            ->map(function ($taskAssignTo) {
                return explode(',', $taskAssignTo);
            })
            ->flatten()
            ->filter()
            ->unique();
        // get assigned user ids from fetched data of tasks with dues today OLD
        // $users_id = [];
        // foreach ($tasksWithDue as $value) {
        //     $task_assign_to = $value['task_assign_to'] ?? '';

        //     if ($task_assign_to !== '') {
        //         $temp_users_id = explode(",", $task_assign_to);
        //         $users_id = array_merge($users_id, array_diff($temp_users_id, $users_id));
        //     }
        // }

        // Fetch users with the retrieved IDs and send email notifications
        $users = User::whereIn('user_id', $users_id)->get();

        $users->each(function ($user) {
            Mail::send('mail.task_due_notification', ['user' => $user], function ($message) use ($user) {
                $message->to($user->email)->subject('Task Due Today Reminder');
            });
        });
    }

    public function getContactByTaskId($task_id)
    {
        $task = Task::find($task_id);
        if (!$task) {
            return response([]);
        }

        $contact = Contact::find((int)$task->task_contact);
        if (!$contact) {
            return response([
                'status' => 'failed fetching user'
            ]);
        }
        return response([
            'success' => true,
            'contact' => $contact
        ]);
    }

    /**
     * fetch task tags by task id
     *
     * @param int $task_id
     * @return response array
     */
    public function getTaskTags($task_id)
    {
        $task = Task::find($task_id);
        if (!$task) {
            return response([]);
        }

        $tags = [];

        $tagsArray = explode(",", $task->task_tag);
        foreach ($tagsArray as $tag) {
            $tagData = TaskTag::find($tag);
            if ($tagData) {
                $tags[] = $tagData;
            }
        }

        return response($tags);
    }

    public function getAssignedUsersByTaskId($task_id)
    {

        $task = Task::find($task_id);
        if ($task) {
            $user_ids = explode(",", $task->task_assign_to);
            $users = User::whereIn('user_id', $user_ids)->get();

            return response($users);
        }

        return response([]);
    }

    public function setPriority(Request $request)
    {

        $task = Task::find($request->task_id);
        if ($task) {
            $task->task_priority = $request->priority;
            $task->save();

            return response([
                'status' => 'success',
                'message' => 'Task priority updated successfully'
            ]);
        }

        return response([
            'status' => 'error',
            'message' => 'Something went wrong!'
        ]);
    }

    public function setNote(Request $request)
    {
        $request->validate([
            'note' => 'required',
            'task_id' => 'required'
        ]);

        Task::find($request->task_id)->update(['note' => $request->note]);
        $user_id = $request->user()->user_id;

        DB::table('comment')->insert([
            'comment_task_id' => $request->task_id,
            'comment_user_id' => $user_id,
            'comment_message' => 'NOTE UPDATE: ' . $request->note,
            'comment_type' => 8
        ]);
        return response(['status' => 'success']);
    }

    public function getTaskNote($task_id)
    {
        if ($task = Task::where('task_id', $task_id)->first()) {
            return response(["data" => $task['note']]);
        } else {
            abort("403");
        }
    }

    public function getStatusesByListId($list_id)
    {
        $statuses = Status::where('status_list_id', $list_id)->get()->toArray();

        return response([
            'status' => 'success',
            "data" => $statuses,
        ]);
    }
}
