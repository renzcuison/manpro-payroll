<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'status';

		protected $primaryKey = 'status_id';

		public $timestamps = false;

		protected $guarded = [];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];

    public function list()
    {
      return $this->belongsTo(ListModel::class,"status_list_id", "list_id");
    }

    public function field()
    {
      return $this->belongsToMany(Field::class, 'status');
    }

}