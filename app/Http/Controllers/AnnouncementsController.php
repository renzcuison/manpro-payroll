<?php

namespace App\Http\Controllers;

use App\Models\AnnouncementsModel;
use App\Models\AnnouncementFilesModel;
use App\Models\AnnouncementBranchesModel;
use App\Models\AnnouncementDepartmentsModel;

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
        //Log::info("AnnouncementsController::saveAnnouncement");

        $user = Auth::user();
        //Log::info("Request Info:");
        //Log::info($request);

        if ($this->checkUser()){
            try {
                
                DB::beginTransaction();

                // Announcement Entry
                $announcement = AnnouncementsModel::create([
                    'user_id' => $user->id,
                    'client_id' => $user->client_id,
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                    'published' => null
                ]);
                
                
                // File Handling
                $dateTime = now()->format('YmdHis');

                // (Documents)
                if ($request->hasFile('attachment')) {
                    foreach ($request->file('attachment') as $file){
                        $fileName = 'attachment_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                        $filePath = $file->storeAs('announcements/attachments', $fileName, 'public');
                        //Log::info($fileName);
                        //Log::info($filePath);
                        AnnouncementFilesModel::create([
                            'announcement_id' => $announcement->id,
                            'type' => "Document",
                            'path' => $filePath,
                            'thumbnail' => false,
                        ]);
                    }
                }

                // (Images)
                if ($request->hasFile('image')) {
                    foreach ($request->file('image') as $index => $file){
                        $fileName = 'attachment_' . pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME). '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                        $filePath = $file->storeAs('announcements/images', $fileName, 'public');
                        //Log::info($fileName);
                        //Log::info($filePath);
                        AnnouncementFilesModel::create([
                            'announcement_id' => $announcement->id,
                            'type' => "Document",
                            'path' => $filePath,
                            'thumbnail' => $index == $request->input('thumbnail'),
                        ]);
                    }
                }
                
                DB::commit();
                
                return response()->json([ 'status' => 200 ]);
    
            } catch (\Exception $e) {
                DB::rollBack();
    
                Log::error("Error saving: " . $e->getMessage());
    
                throw $e;
            }
        } else {
            return response()->json([ 'status' => 200 ]);
        }

    }

    public function publishAnnouncement(Request $request)
    {
        //Log::info("AnnouncementsController::publishAnnouncement");
        //Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                
                DB::beginTransaction();

                $announcementId = $request->input('announcement');
                $announcement = AnnouncementsModel::find($announcementId);
            
                $dateTime = now();
                $announcement->published = $dateTime;
                $announcement->save();

                foreach($request->input('departments') as $key => $departmentId){
                    //Log::info($announcementId . " " . $departmentId);
                    AnnouncementDepartmentsModel::create([
                        'announcement_id' => $announcement->id,
                        'department_id' => $departmentId
                    ]);
                }

                foreach($request->input('branches') as $key => $branchId){
                    //Log::info($announcementId . " " . $branchId);
                    AnnouncementBranchesModel::create([
                        'announcement_id' => $announcement->id,
                        'branch_id' => $branchId
                    ]);
                }
                
                DB::commit();
                
                return response()->json([ 'status' => 200 ]);
    
            } catch (\Exception $e) {
                DB::rollBack();
    
                Log::error("Error saving: " . $e->getMessage());
    
                throw $e;
            }

            
        } else {
            return response()->json([ 'status' => 200]);
        }


    }

    public function getThumbnail($id)
    {
        //Log::info("AnnouncementsController::getThumbnail");

        $user = Auth::user();

        if ($this->checkUser()) {
            //Log::info($id);

            $thumbnailFile = AnnouncementFilesModel::where('announcement_id', $id)
            ->where('thumbnail', true)
            ->first();

            $thumbnail = null;
            $thumbnail = null;
            if ($thumbnailFile) {
                $thumbnail = base64_encode(Storage::disk('public')->get($thumbnailFile->path));
            }

            return response()->json([ 'status' => 200, 'thumbnail' => $thumbnail]);
        } else {
            return response()->json([ 'status' => 200, 'thumbnail' => null]);
        }
    }

    public function getMyAnnouncements(Request $request)
    {
        //Log::info("AnnouncementsController::getMyAnnouncements");
        $user = Auth::user();
        //Log::info($user->branch_id);
        //Log::info($user->department_id);

        // Branch Announcements
        $branches = AnnouncementsModel::whereHas('branches', function($query) use ($user) {
            $query->where('branch_id', $user->branch_id);
        })->get();

        // Department Announcements
        $departments = AnnouncementsModel::whereHas('departments', function($query) use ($user) {
            $query->where('department_id', $user->department_id);
        })->get();

        $announcements = $branches->merge($departments)->unique('id');

        return response()->json(['status' => 200, 'announcements' => $announcements]);
    
    }
}
