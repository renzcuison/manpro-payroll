<?php

namespace App\Http\Controllers;

use App\Models\AnnouncementAcknowledgementsModel;
use App\Models\AnnouncementsModel;
use App\Models\AnnouncementFilesModel;
use App\Models\AnnouncementBranchesModel;
use App\Models\AnnouncementDepartmentsModel;
use App\Models\BranchesModel;
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
                    'unique_code' => $announcement->unique_code,
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

    public function getMyAnnouncements()
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

    public function getAnnouncementDetails($code)
    {
        //Log::info("AnnouncementsController::getAnnouncementDetails");

        $user = Auth::user();

        if ($this->checkUser()) {
            $announcement = AnnouncementsModel::where('unique_code', $code)
                ->firstOrFail();

            return response()->json(['status' => 200, 'announcement' => $announcement]);
        } else {
            return response()->json(['status' => 200, 'announcement' => null]);
        }
    }

    public function getEmployeeAnnouncementDetails($code)
    {
        //Log::info("AnnouncementsController::getEmployeeAnnouncementDetails");

        $user = Auth::user();

        $announcement = AnnouncementsModel::where('unique_code', $code)
            ->with(['acknowledgements', 'branches', 'departments'])
            ->firstOrFail();

        $acknowledgement = $announcement->acknowledgements()
            ->where('user_id', $user->id)
            ->first();

        $acknowledged = $acknowledgement !== null;
        $acknowledgementTimestamp = $acknowledged ? $acknowledgement->created_at : null;

        $announcement->acknowledged = $acknowledged;
        $announcement->ack_timestamp = $acknowledgementTimestamp;

        $branches = $announcement->branches->pluck('branch_id')->unique()->toArray();
        $departments = $announcement->departments->pluck('department_id')->unique()->toArray();

        $announcement->branch_matched = in_array($user->branch_id, $branches);
        $announcement->department_matched = in_array($user->department_id, $departments);

        $announcementData = $announcement->toArray();
        unset($announcementData['acknowledgements'], $announcementData['branches'], $announcementData['departments']);

        return response()->json(['status' => 200, 'announcement' => $announcementData]);
    }

    public function saveAnnouncement(Request $request)
    {
        //Log::info("AnnouncementsController::saveAnnouncement");

        $user = Auth::user();

        if ($this->checkUser()) {
            try {

                DB::beginTransaction();

                $uniqueCode = $this->generateRandomCode(16);
                while (AnnouncementsModel::where('unique_code', $uniqueCode)->exists()) {
                    $uniqueCode = $this->generateRandomCode(16);
                }

                // Announcement Entry
                $announcement = AnnouncementsModel::create([
                    'unique_code' => $uniqueCode,
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
                        $thumbnail = $index == $request->input('thumbnail');
                        AnnouncementFilesModel::create([
                            'announcement_id' => $announcement->id,
                            'type' => $thumbnail ? "Thumbnail" : "Image",
                            'path' => $filePath,
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

    public function editAnnouncement(Request $request)
    {
        //Log::info("AnnouncementsController::editAnnouncement");
        //Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                //Announcement Update
                $announcement = AnnouncementsModel::where('unique_code', $request->input('unique_code'))->first();

                $announcement->title = $request->input('title');
                $announcement->description = $request->input('description');
                $announcement->save();

                $deleteFiles = array_merge($request->input('deleteImages'), $request->input('deleteAttachments'));

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
                                ->where('type', "Thumbnail")
                                ->first();
                            if ($oldThumbnail) {
                                $oldThumbnail->type = "Image";
                                $oldThumbnail->save();
                            }
                        }
                        $newThumbnail = $index == $request->input('thumbnail');
                        $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '_' . $dateTime . '.' . $file->getClientOriginalExtension();
                        $filePath = $file->storeAs('announcements/images', $fileName, 'public');
                        AnnouncementFilesModel::create([
                            'announcement_id' => $announcement->id,
                            'type' => $newThumbnail ? "Thumbnail" : "Image",
                            'path' => $filePath,
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

    public function publishAnnouncement(Request $request)
    {
        //Log::info("AnnouncementsController::publishAnnouncement");
        //Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            try {

                DB::beginTransaction();

                $announcement = AnnouncementsModel::where('unique_code', $request->input('announcement'))->first();
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

    public function toggleHide($code)
    {
        //Log::info("AnnouncementsController::toggleHide");
        $user = Auth::user();

        if ($this->checkUser()) {

            $announcement = AnnouncementsModel::where('unique_code', $code)->first();

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

    public function getAnnouncementBranchDepts($code)
    {
        //Log::info("AnnouncementsController::getAnnouncementBranchDepts");

        $user = Auth::user();

        if ($this->checkUser()) {

            $announcement = AnnouncementsModel::where('unique_code', $code)
                ->select('id')
                ->first();

            $branches = AnnouncementBranchesModel::where('announcement_id', $announcement->id)
                ->join('branches', 'announcement_branches.branch_id', '=', 'branches.id')
                ->select('announcement_branches.announcement_id', 'branches.acronym')
                ->distinct()
                ->pluck('acronym')
                ->unique()
                ->toArray();

            $departments = AnnouncementDepartmentsModel::where('announcement_id', $announcement->id)
                ->join('departments', 'announcement_departments.department_id', '=', 'departments.id')
                ->select('announcement_departments.announcement_id', 'departments.acronym')
                ->distinct()
                ->pluck('acronym')
                ->unique()
                ->toArray();

            return response()->json(['status' => 200, 'branches' => $branches, 'departments' => $departments]);
        } else {
            return response()->json(['status' => 200, 'branches' => null, 'departments' => null]);
        }
    }

    public function getThumbnail($code)
    {
        //Log::info("AnnouncementsController::getThumbnail");

        $user = Auth::user();

        $announcement = AnnouncementsModel::where('unique_code', $code)
            ->select('id')
            ->first();

        $thumbnailFile = AnnouncementFilesModel::where('announcement_id', $announcement->id)
            ->where('type', "Thumbnail")
            ->first();

        $thumbnail = null;
        if ($thumbnailFile) {
            $thumbnail = base64_encode(Storage::disk('public')->get($thumbnailFile->path));
        }

        return response()->json(['status' => 200, 'thumbnail' => $thumbnail]);
    }

    public function getPageThumbnails(Request $request)
    {
        //Log::info("AnnouncementsController::getPageThumbnails");

        $user = Auth::user();

        $announcementIds = $request->input('announcementIds', []);

        $thumbnails = array_fill_keys($announcementIds, null);

        $thumbnailFiles = AnnouncementFilesModel::whereIn('announcement_id', $announcementIds)
            ->where('type', "Thumbnail")
            ->get();

        $thumbnailFiles->each(function ($file) use (&$thumbnails) {
            $thumbnails[$file->announcement_id] = base64_encode(Storage::disk('public')->get($file->path));
        });

        return response()->json(['status' => 200, 'thumbnails' => array_values($thumbnails)]);
    }

    public function getAnnouncementFiles($code)
    {
        //Log::info("AnnouncementsController::getAnnouncementFiles");
        $user = Auth::user();


        if ($this->checkUser()) {
            $announcement = AnnouncementsModel::where('unique_code', $code)
                ->select('id')
                ->first();

            $files = AnnouncementFilesModel::where('announcement_id', $announcement->id)
                ->select('id', 'path', 'type')
                ->get();

            $fileData = [];
            foreach ($files as $file) {
                $fileData[] = [
                    'id' => $file->id,
                    'filename' => basename($file->path),
                    'type' => $file->type
                ];
            }

            return response()->json(['status' => 200, 'files' => $fileData ? $fileData : null]);
        } else {
            return response()->json(['status' => 200, 'files' => null]);
        }
    }

    public function getEmployeeAnnouncementFiles($code)
    {
        // Log::info("AnnouncementsController::getEmployeeAnnouncementFiles");
        $user = Auth::user();

        $announcement = AnnouncementsModel::where('unique_code', $code)
            ->select('id')
            ->firstOrFail();

        $files = AnnouncementFilesModel::where('announcement_id', $announcement->id)
            ->select('id', 'path', 'type')
            ->get();

        $imageData = $files->whereIn('type', ['Image', 'Thumbnail'])
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'filename' => basename($file->path),
                    'type' => $file->type
                ];
            })
            ->values()
            ->all();

        $attachmentData = $files->where('type', 'Document')
            ->map(function ($file) {
                return [
                    'id' => $file->id,
                    'filename' => basename($file->path),
                    'type' => $file->type
                ];
            })
            ->values()
            ->all();

        return response()->json([
            'status' => 200,
            'images' => $imageData,
            'attachments' => $attachmentData
        ]);
    }

    public function downloadAttachment($id)
    {
        //Log::info("AnnouncementsController::downloadAttachment");
        $file = AnnouncementFilesModel::find($id);

        if (!$file) {
            return response()->json(['status' => 404, 'message' => 'Attachment not found'], 404);
        }

        $filePath = storage_path('app/public/' . $file->path);

        if (!file_exists($filePath)) {
            return response()->json(['status' => 404, 'message' => 'File not found'], 404);
        }

        $fileName = basename($file->path);

        return response()->download($filePath, $fileName);
    }

    public function acknowledgeAnnouncement(Request $request)
    {
        //Log::info("AnnouncementsController::acknowledgeAnnouncement");
        $user = Auth::user();

        try {
            DB::beginTransaction();

            $announcement = AnnouncementsModel::where('unique_code', $request->input('code'))->select('id')->first();

            AnnouncementAcknowledgementsModel::create([
                'user_id' => $user->id,
                'announcement_id' => $announcement->id,
            ]);

            DB::commit();

            return response()->json(['status' => 200]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error("Error saving: " . $e->getMessage());

            throw $e;
        }
    }

    public function getAcknowledgements($code)
    {
        //Log::info("AnnouncementsController::getAnnouncementAcknowledgements");
        $user = Auth::user();
        if ($this->checkUser()) {

            $clientId = $user->client_id;
            $announcement = AnnouncementsModel::where('unique_code', $code)
                ->with(['acknowledgements', 'branches', 'departments'])
                ->firstOrFail();

            // Acknowledged Users
            $acknowledgements = $announcement->acknowledgements->map(function ($ack) {
                $emp = $ack->user;

                return [
                    'emp_id' => $emp->id,
                    'emp_first_name' => $emp->first_name,
                    'emp_middle_name' => $emp->middle_name ?? '',
                    'emp_last_name' => $emp->last_name,
                    'emp_suffix' => $emp->suffix ?? '',
                    'timestamp' => $ack->created_at,
                ];
            })->all();

            // Unacknowledged Users
            $branches = $announcement->branches->pluck('branch_id')->unique()->toArray();
            $departments = $announcement->departments->pluck('department_id')->unique()->toArray();

            $acknowledgedUsers = $announcement->acknowledgements->pluck('user_id')->unique()->toArray();

            //Log::info($acknowledgedUsers);

            $unacknowledged = UsersModel::where('client_id', $clientId)
                ->where(function ($query) use ($branches, $departments) {
                    if (!empty($branches)) {
                        $query->whereIn('branch_id', $branches);
                    }
                    if (!empty($departments)) {
                        $query->orWhereIn('department_id', $departments);
                    }
                })
                ->whereNotIn('id', $acknowledgedUsers)
                ->select('id', 'first_name', 'middle_name', 'last_name', 'suffix')
                ->get()
                ->map(function ($employee) {
                    return [
                        'emp_id' => $employee->id,
                        'emp_first_name' => $employee->first_name,
                        'emp_middle_name' => $employee->middle_name ?? '',
                        'emp_last_name' => $employee->last_name,
                        'emp_suffix' => $employee->suffix ?? ''
                    ];
                })
                ->all();

            //Log::info($unacknowledged);

            return response()->json(['status' => 200, 'acknowledgements' => $acknowledgements, 'unacknowledged' => $unacknowledged]);
        } else {
            return response()->json(['status' => 200, 'acknowledgements' => null]);
        }
    }

    function generateRandomCode($length)
    {
        // log::info("AnnouncementsController::generateRandomCode");
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        $result = '';
        $charsLength = strlen($chars);

        for ($i = 0; $i < $length; $i++) {
            $result .= $chars[rand(0, $charsLength - 1)];
        }

        return $result;
    }
}
