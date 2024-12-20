<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Field extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'field';

		protected $primaryKey = 'field_id';

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
      return $this->hasMany(Status::class, 'field_id', 'field_id');
    }
		
}