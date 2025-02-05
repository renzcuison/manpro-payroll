<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AnnouncementsController extends Controller
{
    public function checkUser()
    {
        // Log::info("AnnouncementsController::checkUser");

        if (Auth::check()) {
            $user = Auth::user();

            if ($user->user_type == 'Admin') {
                return true;
            }
        }

        return false;
    }

    public function getAnnouncements()
    {
        //Log::info("AnnouncementsController::getAnnouncements");

        $user = Auth::user();

        if ($this->checkUser()) {
            $clientId = $user->client_id;
            $apps = Announcements::where('client_id', $clientId)->get();

            $applications = [];

            foreach ($apps as $app) {
                $employee = $app->user;
                $type = $app->type;

                $announcements[] = [
                    'app_id' => $app->id,
                    'app_type' => $type->name,
                    'app_duration_start' => $app->duration_start,
                    'app_duration_end' => $app->duration_end,
                    'app_date_requested' => $app->created_at,
                    'app_attachment' => basename($app->attachment),
                    'app_description' => $app->description,
                    'app_status' => $app->status,
                    'emp_first_name' => $employee->first_name,
                    'emp_middle_name' => $employee->middle_name,
                    'emp_last_name' => $employee->last_name,
                    'emp_suffix' => $employee->suffix,
                ];
            }

            return response()->json(['status' => 200, 'announcements' => $announcements]);
        } else {
            return response()->json(['status' => 200, 'announcements' => null]);
        }
    }


}
