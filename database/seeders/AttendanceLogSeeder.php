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

        // $workHourId = WorkHour::first()?->id ?? WorkHour::factory()->create()->id;

        DB::table('attendance_logs')->insert([
            [
                'user_id' => 65,
                'work_hour_id' => 1,
                'action' => 'Duty In',
                'method' => '1',
                'timestamp' => Carbon::now()->subYear()->setTime(8, 0, 0),
                'attendance_summary_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 65,
                'work_hour_id' => 1,
                'action' => 'Duty Out',
                'method' => '1',
                'timestamp' => Carbon::now()->subYear()->setTime(17, 0),
                'attendance_summary_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 65,
                'work_hour_id' => 1,
                'action' => 'Duty In',
                'method' => '1',
                'timestamp' => Carbon::yesterday()->setTime(8, 0, 0),
                'attendance_summary_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 65,
                'work_hour_id' => 1,
                'action' => 'Duty Out',
                'method' => '1',
                'timestamp' => Carbon::yesterday()->setTime(17, 0, 0),
                'attendance_summary_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 65,
                'work_hour_id' => 1,
                'action' => 'Overtime In',
                'method' => '1',
                'timestamp' => Carbon::yesterday()->setTime(20, 0, 0),
                'attendance_summary_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 65,
                'work_hour_id' => 1,
                'action' => 'Overtime Out',
                'method' => '1',
                'timestamp' => Carbon::yesterday()->setTime(22, 0, 0),
                'attendance_summary_id' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
