<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ServicesStep extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'tbl_services_steps';

		protected $primaryKey = 'service_step_id';

		public $timestamps = false;

		protected $guarded = [];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];

    
    public function statuses()
    {
      return $this->hasMany(Status::class, 'step_id');
    }

}