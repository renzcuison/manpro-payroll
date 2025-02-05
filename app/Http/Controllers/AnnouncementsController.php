<?php

namespace App\Http\Controllers;

use App\Models\AnnouncementsModel;
use App\Models\AnnouncementFilesModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

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
            $announcements = AnnouncementsModel::where('client_id',$clientId)->get();

            return response()->json([ 'status' => 200, 'announcements' => $announcements]);
        } else {
            return response()->json([ 'status' => 200, 'announcements' => null]);
        }
    }

    public function saveAnnouncement(Request $request)
    {
        Log::info("AnnouncementsController::saveAnnouncement");

        $user = Auth::user();
        Log::info("Request Info:");
        Log::info($request);

        if ($this->checkUser()){
            try {
                DB::beginTransaction();
    
                AnnouncementsModel::create([
                    'user_id' => $user->id,
                    'client_id' => $user->client_id,
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                    'published' => false
                ]);

                if ($request ->hasFile('attachment')){
                    $file = $request->file('attachment');
                    $dateTime = now()->format('YmdHis');
                    $fileName = 'attachment_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                }
                
                DB::commit();
                
                return response()->json([ 'status' => 200 ]);
    
            } catch (\Exception $e) {
                DB::rollBack();
    
                //Log::error("Error saving: " . $e->getMessage());
    
                throw $e;
            }
        } else {
            return response()->json([ 'status' => 200 ]);
        }

        /*
        if ($this->checkUser()) {
            $clientId = $user->client_id;
            $announcements = AnnouncementsModel::where('client_id',$clientId)->get();

            return response()->json([ 'status' => 200, 'announcements' => $announcements]);
        } else {
            return response()->json([ 'status' => 200, 'announcements' => null]);
        }
        */
    }


}
