<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationPercentageAnswer extends Model
{
    use HasFactory;

    protected $table = 'evaluation_percentage_answers';

    protected $primaryKey = ['response_id', 'subcategory_id'];
    public $incrementing = false;

    protected $fillable = [
        'response_id',
        'subcategory_id',
        'percentage',
        'deleted_at'
    ];
    
    protected $casts = [
        'linear_scale_index' => 'integer',
        'value' => 'integer'
    ];

    protected function getKeyForSaveQuery()
    {

        $primaryKeyForSaveQuery = array(count($this->primaryKey));
        foreach ($this->primaryKey as $i => $pKey) {
            $primaryKeyForSaveQuery[$i] = isset($this->original[$this->getKeyName()[$i]])
                ? $this->original[$this->getKeyName()[$i]]
                : $this->getAttribute($this->getKeyName()[$i]);
        }
        return $primaryKeyForSaveQuery;

    }

    public function response()
    {
        return $this->belongsTo(EvaluationResponse::class, 'response_id');
    }

    protected function setKeysForSaveQuery($query)
    {

        foreach ($this->primaryKey as $i => $pKey) {
            $query->where($this->getKeyName()[$i], '=', $this->getKeyForSaveQuery()[$i]);
        }

        return $query;
    }

    public function subcategory()
    {
        return $this->belongsTo(EvaluationFormSubcategory::class, 'subcategory_id');
    }

}
