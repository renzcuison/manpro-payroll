<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PemeRequirementsResponsesModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'peme_requirements_responses';

    protected $fillable = [
        'peme_requirement_id',
        'peme_response_id',
    ];

    public function pemeRequirements()
    {
        return $this->belongsTo(PemeRequirementsModel::class, 'peme_requirement_id');
    }
    public function pemeResponse()
    {
        return $this->belongsTo(PemeResponsesModel::class, 'peme_response_id');
    }


}
