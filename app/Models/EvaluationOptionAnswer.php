<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationOptionAnswer extends Model
{
    use HasFactory;

    protected $table = 'evaluation_option_answers';

    protected $primaryKey = ['response_id', 'option_id'];
    public $incrementing = false;

    protected $fillable = [
        'response_id',
        'option_id',
        'deleted_at'
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

    public function option()
    {
        return $this->belongsTo(EvaluationFormSubcategoryOption::class, 'option_id');
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

}
