<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinanceTransaction extends Model
{
    use HasFactory;

		/**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'finance_transaction';

		protected $primaryKey = 'val_id';

		public $timestamps = false;

		protected $fillable = [];

		/**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];

    public function task()
    {
      return $this->belongsTo(Task::class,'val_assign_to');
    }

    public function phase()
    {
      return $this->belongsTo(FinancePhase::class,'val_phase_id');
    }

    public function settle()
    {
      return $this->hasMany(PaymentSettle::class,'transaction_id');
    }

}