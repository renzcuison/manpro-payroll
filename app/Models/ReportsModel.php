<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportsModel extends Model
{
    use HasFactory;

    protected $table = 'reports';

    protected $primaryKey = 'id';

    protected $fillable = [
        'client_id',
        'team',
        'title',
        'date',
        'report_type_id',
        'period_from',
        'period_to',
        'description',
        'attachment',
        'created_by',
        'is_edited',
        'is_deleted',
        'deleted_by',
        'created_at',
        'updated_at',
    ];

    public function reportType()
    {
        return $this->belongsTo(ReportTypesModel::class, 'report_type_id');
    }

    public function assignedEmployees()
    {
        return $this->hasMany(ReportEmployeesModel::class, 'report_id');
    }

    public function viewers()
    {
        return $this->hasMany(ReportViewersModel::class, 'report_id');
    }
}
