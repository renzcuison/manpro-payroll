<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AttendanceLogsModel;
use App\Models\WorkHoursModel as WorkHour;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceLogSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {

        $workHourId = WorkHour::first()?->id ?? WorkHour::factory()->create()->id;

        DB::table('attendance_logs')->insert([
            [
                'user_id' => 65,
                'work_hour_id' => $workHourId,
                'action' => 'in',
                'method' => 'manual',
                'timestamp' => Carbon::now()->subYear()->startOfDay(),
                'attendance_summary_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 65,
                'work_hour_id' => $workHourId,
                'action' => 'out',
                'method' => 'manual',
                'timestamp' => now(),
                'attendance_summary_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
