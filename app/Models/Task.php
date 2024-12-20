<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'task';

		protected $primaryKey = 'task_id';

		public $timestamps = false;

		protected $fillable = ['note'];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];

    public function list()
    {
      return $this->belongsTo(ListModel::class,'task_list_id')->with('service');
    }

    public function client()
    {
      return $this->belongsTo(Contact::class,'task_contact');
    }

    public function status()
    {
      return $this->hasOne(Status::class,'status_id','task_status_id', );
    }

    public function transactions()
    {
      return $this->hasMany(FinanceTransaction::class,'val_assign_to');
    }

}