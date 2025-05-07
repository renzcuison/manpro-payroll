<?php

namespace App\Http\Controllers;

use App\Models\AnnouncementAcknowledgementsModel;
use App\Models\AnnouncementsModel;
use App\Models\AnnouncementBranchesModel;
use App\Models\AnnouncementDepartmentsModel;
use App\Models\UsersModel;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class AnnouncementsController extends Controller
{
    // Authentication
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

    // Lists
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

                $recCount = UsersModel::where('user_type', "Employee")
                    ->where(function ($query) use ($branches, $departments) {
                        $query->whereIn('branch_id', $branches)
                            ->orWhereIn('department_id', $departments);
                    })
                    ->distinct()
                    ->count('id');

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

    public function getEmployeeAnnouncements()
    {
        //Log::info("AnnouncementsController::getEmployeeAnnouncements");
        $user = Auth::user();

        $branches = AnnouncementsModel::whereHas('branches', function ($query) use ($user) {
            $query->where('branch_id', $user->branch_id);
        })
            ->where('status', 'Published')
            ->with(['branches', 'departments'])
            ->get();

        $departments = AnnouncementsModel::whereHas('departments', function ($query) use ($user) {
            $query->where('department_id', $user->department_id);
        })
            ->where('status', 'Published')
            ->with(['branches', 'departments'])
            ->get();

        $announcements = $branches->merge($departments)->unique('id');

        $announcementData = $announcements->map(function ($announcement) use ($user) {
            $acknowledgement = AnnouncementAcknowledgementsModel::where('announcement_id', $announcement->id)
                ->where('user_id', $user->id)
                ->first();

            $announcement->acknowledged_on = $acknowledgement ? $acknowledgement->created_at : null;

            $branches = $announcement->branches->pluck('branch_id')->unique()->toArray();
            $departments = $announcement->departments->pluck('department_id')->unique()->toArray();

            $announcement->branch_matched = in_array($user->branch_id, $branches);
            $announcement->department_matched = in_array($user->department_id, $departments);

            unset($announcement['branches'], $announcement['departments']);
            return $announcement;
        });

        return response()->json(['status' => 200, 'announcements' => $announcementData]);
    }

    // Management
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

                // Adding Files - Documents
                if ($request->hasFile('attachment')) {
                    foreach ($request->file('attachment') as $file) {
                        $announcement->addMedia($file)
                            ->withCustomProperties(['type' => 'Document'])
                            ->toMediaCollection('documents');
                    }
                }

                // Adding Files - Images
                if ($request->hasFile('image')) {
                    foreach ($request->file('image') as $index => $file) {
                        $isThumbnail = $index == $request->input('thumbnail');
                        $collection = $isThumbnail ? 'thumbnails' : 'images';
                        $announcement->addMedia($file)
                            ->withCustomProperties(['type' => $isThumbnail ? 'Thumbnail' : 'Image'])
                            ->toMediaCollection($collection);
                    }
                }

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error("Error saving: " . $e->getMessage());
                return response()->json(['status' => 500, 'message' => 'Error Saving Announcement'], 500);
                throw $e;
            }
        } else {
            return response()->json(['status' => 200]);
        }
    }

    public function editAnnouncement(Request $request)
    {
        $user = Auth::user();

        if ($this->checkUser()) {
            try {
                DB::beginTransaction();

                // Announcement Update
                $announcement = AnnouncementsModel::where('unique_code', $request->input('unique_code'))->first();

                $announcement->title = $request->input('title');
                $announcement->description = $request->input('description');
                $announcement->save();

                // File Removal Prep
                $deleteFiles = array_merge(
                    $request->input('deleteImages', []),
                    $request->input('deleteAttachments', [])
                );

                // Remove Files
                if (!empty($deleteFiles)) {
                    $mediaItems = $announcement->getMedia('*')->whereIn('id', $deleteFiles);
                    foreach ($mediaItems as $media) {
                        $media->delete();
                    }
                }

                // Adding Files - Documents
                if ($request->hasFile('attachment')) {
                    foreach ($request->file('attachment') as $file) {
                        $announcement->addMedia($file)
                            ->withCustomProperties(['type' => 'Document'])
                            ->toMediaCollection('documents');
                    }
                }

                // Adding Files - Images
                if ($request->hasFile('image')) {
                    foreach ($request->file('image') as $index => $file) {
                        $isThumbnail = $index == $request->input('thumbnail');
                        if ($isThumbnail) {
                            $announcement->clearMediaCollection('thumbnails');
                        }
                        $collection = $isThumbnail ? 'thumbnails' : 'images';
                        $announcement->addMedia($file)
                            ->withCustomProperties(['type' => $isThumbnail ? 'Thumbnail' : 'Image'])
                            ->toMediaCollection($collection);
                    }
                }

                DB::commit();

                return response()->json(['status' => 200]);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error("Error saving: " . $e->getMessage());
                throw $e;
            }
        }

        return response()->json(['status' => 403, 'message' => 'Unauthorized'], 403);
    }

    public function publishAnnouncement(Request $request)
    {
        //Log::info("AnnouncementsController::publishAnnouncement");
        //Log::info($request);

        $user = Auth::user();

        if ($this->checkUser()) {
            try {

                DB::beginTransaction();

                $announcement = AnnouncementsModel::where('unique_code', $request->input('unique_code'))->first();
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

    public function toggleHide(Request $request)
    {
        //Log::info("AnnouncementsController::toggleHide");
        $user = Auth::user();

        if ($this->checkUser()) {

            $announcement = AnnouncementsModel::where('unique_code', $request->input('unique_code'))->first();

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

    // Details
    public function getAnnouncementDetails($code)
    {
        //Log::info("AnnouncementsController::getAnnouncementDetails");
        $user = Auth::user();

        if ($this->checkUser()) {
            $announcement = AnnouncementsModel::where('unique_code', $code)
                ->with('user')
                ->firstOrFail();

            // Author Information
            $author = $announcement->user;
            $announcement->author_name = implode(' ', array_filter([
                $author->first_name ?? null,
                $author->middle_name ?? null,
                $author->last_name ?? null,
                $author->suffix ?? null,
            ]));
            $announcement->author_title = $author->jobTitle->name;

            $announcementData = $announcement->toArray();
            unset($announcementData['user']);

            return response()->json(['status' => 200, 'announcement' => $announcementData]);
        } else {
            return response()->json(['status' => 200, 'announcement' => null]);
        }
    }

    public function getEmployeeAnnouncementDetails($code)
    {
        //Log::info("AnnouncementsController::getEmployeeAnnouncementDetails");

        $user = Auth::user();

        $announcement = AnnouncementsModel::where('unique_code', $code)
            ->with(['acknowledgements', 'branches', 'departments', 'user'])
            ->firstOrFail();

        $acknowledgement = $announcement->acknowledgements()
            ->where('user_id', $user->id)
            ->first();

        // Acknowledgement Status
        $acknowledged = $acknowledgement !== null;
        $acknowledgementTimestamp = $acknowledged ? $acknowledgement->created_at : null;

        $announcement->acknowledged = $acknowledged;
        $announcement->ack_timestamp = $acknowledgementTimestamp;

        // Branch, Department Matchup
        $branches = $announcement->branches->pluck('branch_id')->unique()->toArray();
        $departments = $announcement->departments->pluck('department_id')->unique()->toArray();

        $announcement->branch_matched = in_array($user->branch_id, $branches);
        $announcement->department_matched = in_array($user->department_id, $departments);

        // Author Information
        $author = $announcement->user;
        $announcement->author_name = implode(' ', array_filter([
            $author->first_name ?? null,
            $author->middle_name ?? null,
            $author->last_name ?? null,
            $author->suffix ?? null,
        ]));
        $announcement->author_title = $author->jobTitle ? $author->jobTitle->name : "Administrator";

        // Final Data Prep
        $announcementData = $announcement->toArray();
        unset($announcementData['acknowledgements'], $announcementData['branches'], $announcementData['departments'], $announcementData['user']);

        return response()->json(['status' => 200, 'announcement' => $announcementData]);
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

    // Files
    public function downloadFile($id)
    {
        //Log::info('AnnouncementsController::downloadFile');
        $media  = Media::find($id);

        if (!$media) {
            return response()->json(['status' => 404, 'message' => 'File not found'], 404);
        }

        $filePath = $media->getPath();
        if (!file_exists($filePath)) {
            return response()->json(['status' => 404, 'message' => 'File not found'], 404);
        }

        return response()->download($filePath, $media->file_name);
    }

    public function getThumbnail($code)
    {
        $user = Auth::user();
        $announcement = AnnouncementsModel::where('unique_code', $code)
            ->select('id')
            ->first();

        if (!$announcement) {
            return response()->json(['status' => 404, 'message' => 'Announcement not found'], 404);
        }

        $thumbnail = null;
        $thumbnailMedia = $announcement->getMedia('thumbnails')->first();
        if ($thumbnailMedia) {
            $thumbnail = base64_encode(file_get_contents($thumbnailMedia->getPath()));
        }

        return response()->json(['status' => 200, 'thumbnail' => $thumbnail]);
    }

    public function getPageThumbnails(Request $request)
    {
        //Log::info("AnnouncementsController::getPageThumbnails");
        $announcementIds = $request->input('announcement_ids', []);
        $announcements = AnnouncementsModel::whereIn('id', $announcementIds)->get();

        $thumbnails = array_fill_keys($announcementIds, null);
        foreach ($announcements as $announcement) {
            $thumbnailMedia = $announcement->getMedia('thumbnails')->first();
            if ($thumbnailMedia) {
                $thumbnails[$announcement->id] = base64_encode(file_get_contents($thumbnailMedia->getPath()));
            }
        }

        return response()->json(['status' => 200, 'thumbnails' => array_values($thumbnails)]);
    }

    public function getAnnouncementFiles($code)
    {
        $user = Auth::user();

        if ($this->checkUser()) {
            $announcement = AnnouncementsModel::where('unique_code', $code)
                ->select('id')
                ->firstOrFail();

            // Images
            $images = $announcement->getMedia('images')->map(function ($media) {
                return [
                    'id' => $media->id,
                    'filename' => $media->file_name,
                    'type' => $media->getCustomProperty('type'),
                    'data' => base64_encode(file_get_contents($media->getPath())),
                    'mime' => $media->mime_type,
                ];
            })->all();

            $thumbnails = $announcement->getMedia('thumbnails')->map(function ($media) {
                return [
                    'id' => $media->id,
                    'filename' => $media->file_name,
                    'type' => $media->getCustomProperty('type'),
                    'data' => base64_encode(file_get_contents($media->getPath())),
                    'mime' => $media->mime_type,
                ];
            })->all();

            $imageData = array_merge($images, $thumbnails);

            // Documents
            $attachmentData = $announcement->getMedia('documents')->map(function ($media) {
                return [
                    'id' => $media->id,
                    'filename' => $media->file_name,
                    'type' => $media->getCustomProperty('type'),
                ];
            })->all();

            return response()->json([
                'status' => 200,
                'images' => $imageData,
                'attachments' => $attachmentData,
            ]);
        } else {
            return response()->json(['status' => 200, 'images' => null, 'attachments' => null]);
        }
    }

    public function getEmployeeAnnouncementFiles($code)
    {
        $user = Auth::user();

        $announcement = AnnouncementsModel::where('unique_code', $code)
            ->select('id')
            ->firstOrFail();

        // Images
        $images = $announcement->getMedia('images')->map(function ($media) {
            return [
                'id' => $media->id,
                'filename' => $media->file_name,
                'type' => $media->getCustomProperty('type'),
                'data' => base64_encode(file_get_contents($media->getPath())),
                'mime' => $media->mime_type,
            ];
        })->all();

        $thumbnails = $announcement->getMedia('thumbnails')->map(function ($media) {
            return [
                'id' => $media->id,
                'filename' => $media->file_name,
                'type' => $media->getCustomProperty('type'),
                'data' => base64_encode(file_get_contents($media->getPath())),
                'mime' => $media->mime_type,
            ];
        })->all();

        $imageData = array_merge($images, $thumbnails);

        // Documents
        $attachmentData = $announcement->getMedia('documents')->map(function ($media) {
            return [
                'id' => $media->id,
                'filename' => $media->file_name,
                'type' => $media->getCustomProperty('type'),
            ];
        })->all();

        return response()->json([
            'status' => 200,
            'images' => $imageData,
            'attachments' => $attachmentData,
        ]);
    }

    // Acknowledgements
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
                    'emp_profile_pic' => $emp->profile_pic ?? null,
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
                ->where('user_type', "Employee")
                ->whereNotIn('id', $acknowledgedUsers)
                ->select('id', 'first_name', 'middle_name', 'last_name', 'suffix', 'profile_pic')
                ->get()
                ->map(function ($employee) {
                    return [
                        'emp_id' => $employee->id,
                        'emp_first_name' => $employee->first_name,
                        'emp_middle_name' => $employee->middle_name ?? '',
                        'emp_last_name' => $employee->last_name,
                        'emp_suffix' => $employee->suffix ?? '',
                        'emp_profile_pic' => $employee->profile_pic ?? null,
                    ];
                })
                ->all();

            //Log::info($unacknowledged);

            return response()->json(['status' => 200, 'acknowledgements' => $acknowledgements, 'unacknowledged' => $unacknowledged]);
        } else {
            return response()->json(['status' => 200, 'acknowledgements' => null]);
        }
    }

    // Utility
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
