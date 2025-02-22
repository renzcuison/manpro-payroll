<?php

namespace App\Http\Controllers;

use App\Models\AnnouncementAcknowledgementsModel;
use App\Models\AnnouncementsModel;
use App\Models\AnnouncementFilesModel;
use App\Models\AnnouncementBranchesModel;
use App\Models\AnnouncementDepartmentsModel;
use App\Models\UsersModel;

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
        // Log::info("AnnouncementsController::getAnnouncements");

        $user = Auth::user();

        if ($this->checkUser()) {
            $clientId = $user->client_id;
            $announcements = AnnouncementsModel::where('client_id', $clientId)
                ->with(['acknowledgements', 'branches', 'departments'])
                ->get();

            $announcementData = $announcements->map(function ($announcement) {
                // Acknowledged
                $ackCount = $announcement->acknowledgements->count();

                // Total Recipients
                $branches = $announcement->branches->pluck('branch_id')->unique()->toArray();
                $departments = $announcement->departments->pluck('department_id')->unique()->toArray();

                $recCount = UsersModel::whereIn('branch_id', $branches)->orWhereIn('department_id', $departments)->distinct()->count('id');

                return [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'description' => $announcement->description,
                    'status' => $announcement->status,
                    'created_by' => $announcement->user_id,
                    'created_at' => $announcement->created_at,
                    'acknowledged' => $ackCount,
                    'recipients' => $recCount,
                ];
            })->all();


            return response()->json([
                'status' => 200,
                'announcements' => $announcementData,
            ]);
        } else {
            return response()->json(['status' => 200, 'announcements' => null]);
        }
    }

    public function getMyAnnouncements(Request $request)
    {
        //Log::info("AnnouncementsController::getMyAnnouncements");
        $user = Auth::user();

        // Branch Announcements
        $branches = AnnouncementsModel::whereHas('branches', function ($query) use ($user) {
            $query->where('branch_id', $user->branch_id);
        })->where('status', 'Published')->get();

        // Department Announcements
        $departments = AnnouncementsModel::whereHas('departments', function ($query) use ($user) {
            $query->where('department_id', $user->department_id);
        })->where('status', 'Published')->get();

        $announcements = $branches->merge($departments)->unique('id');

        return response()->json(['status' => 200, 'announcements' => $announcements]);
    }

    public function saveAnnouncement(Request $request)
    {
        //Log::info("AnnouncementsController::saveAnnouncement");

        $user = Auth::user();

        if ($this->checkUser()) {
            try {

                DB::beginTransaction();

                // Announcement Entry
                $announcement = AnnouncementsModel::create([
                    'user_id' => $user->id,
                    'client_id' => $user->client_id,
                    'title' => $request->input('title'),
                    'description' => $request->input('description'),
                ]);

                $dateTime = now()->format('YmdHis');

                // Adding Files - Documents
                if ($request->hasFile('attachment')) {
                    foreach ($request->file('attachment') as $file) {
                        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                        $filePath = $file->storeAs('announcements/attachments', $fileName, 'public');
                        AnnouncementFilesModel::create([
                            'announcement_id' => $announcement->id,
                            'type' => "Document",
                            'path' => $filePath,
                            'thumbnail' => false,
                        ]);
                    }
                }

                // Adding Files - Images
                if ($request->hasFile('image')) {
                    foreach ($request->file('image') as $index => $file) {
                        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                        $filePath = $file->storeAs('announcements/images', $fileName, 'public');
                        AnnouncementFilesModel::create([
                            'announcement_id' => $announcement->id,
                            'type' => "Image",
                            'path' => $filePath,
                            'thumbnail' => $index == $request->input('thumbnail'),
                        ]);
                    }
                }

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        } else {
            return response()->json(['status' => 200]);
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

                $announcement = AnnouncementsModel::find($request->input('announcement'));

                $announcement->status = "Published";
                $announcement->save();

                foreach ($request->input('departments') as $key => $departmentId) {
                    //Log::info($announcementId . " " . $departmentId);
                    AnnouncementDepartmentsModel::create([
                        'announcement_id' => $announcement->id,
                        'department_id' => $departmentId
                    ]);
                }

                foreach ($request->input('branches') as $key => $branchId) {
                    //Log::info($announcementId . " " . $branchId);
                    AnnouncementBranchesModel::create([
                        'announcement_id' => $announcement->id,
                        'branch_id' => $branchId
                    ]);
                }

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        } else {
            return response()->json(['status' => 200]);
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

            return response()->json(['status' => 200, 'thumbnail' => $thumbnail]);
        } else {
            return response()->json(['status' => 200, 'thumbnail' => null]);
        }
    }

    public function getPageThumbnails(Request $request)
    {
        //Log::info("AnnouncementsController::getPageThumbnails");

        $user = Auth::user();

        $announcementIds = $request->input('announcementIds', []);

        $thumbnails = array_fill_keys($announcementIds, null);

        $thumbnailFiles = AnnouncementFilesModel::whereIn('announcement_id', $announcementIds)
            ->where('thumbnail', true)
            ->get();

        $thumbnailFiles->each(function ($file) use (&$thumbnails) {
            $thumbnails[$file->announcement_id] = base64_encode(Storage::disk('public')->get($file->path));
        });

        return response()->json(['status' => 200, 'thumbnails' => array_values($thumbnails)]);
    }

    public function editAnnouncement(Request $request)
    {
        //Log::info("AnnouncementsController::editAnnouncement");

        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                //Announcement Update
                $announcement = AnnouncementsModel::find($request->input('id'));

                $announcement->title = $request->input('title');
                $announcement->description = $request->input('description');
                $announcement->save();

                $deleteFiles = array_merge($request->input('deleteImages'), $request->input('deleteAttachments'));

                // Remove Thumbnail
                AnnouncementFilesModel::whereIn('id', $deleteFiles)
                    ->where('thumbnail', true)
                    ->update(['thumbnail' => false]);

                // Remove Files
                AnnouncementFilesModel::whereIn('id', $deleteFiles)->delete();

                $dateTime = now()->format('YmdHis');

                // Adding Files - Documents
                if ($request->hasFile('attachment')) {
                    foreach ($request->file('attachment') as $file) {
                        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                        $filePath = $file->storeAs('announcements/attachments', $fileName, 'public');
                        AnnouncementFilesModel::create([
                            'announcement_id' => $announcement->id,
                            'type' => "Document",
                            'path' => $filePath,
                            'thumbnail' => false,
                        ]);
                    }
                }

                // Adding Files - Images
                if ($request->hasFile('image')) {
                    foreach ($request->file('image') as $index => $file) {
                        // Replace Thumbnail if Applicable
                        if ($index == $request->input('thumbnail')) {
                            $oldThumbnail = AnnouncementFilesModel::where('announcement_id', $request->input('id'))
                                ->where('thumbnail', true)
                                ->first();
                            if ($oldThumbnail) {
                                $oldThumbnail->thumbnail = false;
                                $oldThumbnail->save();
                            }
                        }
                        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                        $filePath = $file->storeAs('announcements/images', $fileName, 'public');
                        AnnouncementFilesModel::create([
                            'announcement_id' => $announcement->id,
                            'type' => "Image",
                            'path' => $filePath,
                            'thumbnail' => $index == $request->input('thumbnail'),
                        ]);
                    }
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());

                throw $e;
            }
        }
    }

    public function getAnnouncementFiles($id)
    {
        //Log::info("AnnouncementsController::getFileNames");
        $user = Auth::user();

        if ($this->checkUser()) {
            $files = AnnouncementFilesModel::where('announcement_id', $id)
                ->select('id', 'path', 'type')
                ->get();

            $filenames = [];
            foreach ($files as $file) {
                $filenames[] = [
                    'id' => $file->id,
                    'filename' => basename($file->path),
                    'type' => $file->type
                ];
            }

            return response()->json(['status' => 200, 'filenames' => $filenames ? $filenames : null]);
        } else {
            return response()->json(['status' => 200, 'filenames' => null]);
        }
    }

    public function toggleHide($id)
    {
        //Log::info("AnnouncementsController::toggleHide");
        $user = Auth::user();

        if ($this->checkUser()) {

            $announcement = AnnouncementsModel::find($id);

            if (!$announcement) {
                return response()->json(['status' => 404, 'message' => 'Announcement not found'], 404);
            }

            $announcement->status = $announcement->status === 'Published' ? 'Hidden' : 'Published';
            $announcement->save();

            return response()->json(['status' => 200]);
        } else {
            return response()->json(['status' => 200]);
        }
    }

    public function getAcknowledgements()
    {
        //Log::info("AnnouncementsController::getAnnouncementAcknowledgements");
    }
}
