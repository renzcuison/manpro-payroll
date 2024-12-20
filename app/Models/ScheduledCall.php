<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScheduledCall extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'tbl_calendar_events';

		protected $primaryKey = 'calendar_event_id';

		const CREATED_AT = 'date_created';

		public $timestamps = false;

		protected $guarded = [];
}
