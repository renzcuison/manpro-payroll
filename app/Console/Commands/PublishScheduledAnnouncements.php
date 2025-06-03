<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\AnnouncementsModel;
use Carbon\Carbon;

class PublishScheduledAnnouncements extends Command
{
    protected $signature = 'announcements:publish-scheduled';
    protected $description = 'Publish announcements scheduled for now or earlier';

    public function handle()
    {
        $now = Carbon::now();
        $announcements = AnnouncementsModel::where('status', 'Pending')
            ->whereNotNull('scheduled_send_datetime')
            ->where('scheduled_send_datetime', '<=', $now)
            ->get();

        foreach ($announcements as $announcement) {
            $announcement->status = 'Published';
            $announcement->save();
            $this->info("Published announcement ID {$announcement->id}");
        }

        return 0;
    }
}