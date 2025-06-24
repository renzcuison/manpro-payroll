<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BenefitBracket extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'benefit_brackets';

    protected $primaryKey = 'id';

    protected $fillable = [
        'benefit_id',
        'range_start',
        'range_end',
        'employer_share',
        'employee_share',
    ];

    public function benefit()
    {
        return $this->belongsTo(BenefitsModel::class, 'benefit_id');
    }
}
