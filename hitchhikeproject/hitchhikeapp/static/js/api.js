///             utility function

function tryParseInt(str, defaultValue) {
    var retValue = defaultValue;
    if (str !== null) {
        try {
            if (!isNaN(str)) {
                retValue = parseInt(str);
            }
        } catch (e) {

        }
    }
    return retValue;
}


///         api functions
var APISettings = (function () {
    function parseCSRFToken() {
        return $('#csrftoken > input').val();
    }
    
    return {
        apiBaseUrl: 'http://localhost:8000/api/'
        , csrf_token: parseCSRFToken()
    }
})();

function showAPIError(fnName, errorText) {
    alert('Error thrown in function ' + fnName + '\nMessage: ' + errorText)
}

async function getModels(modelName, filter, exclude) {
    filter = filter || {};
    exclude = exclude || {};

    if (!modelName) {
        alert('No model name in getModels');
        return;
    }
    
    var jqXHR = $.ajax({
        type: 'POST'
        , async: true
        , url: APISettings.apiBaseUrl + 'getmodels'
        , headers: { "X-CSRFToken": APISettings.csrf_token }
        , xhrFields: {}
        , data: JSON.stringify({
            modelName: modelName
            , modelFilter: filter
            , modelExclude: exclude
        })
        , contentType: 'application/json; charset=utf-8'
    });

    var promise = new Promise(function (resolve, reject) {
        jqXHR.done(function (data, textStatus, jqXHR) {
            //parse JSON object
            dataJson = data;
            try {
                for (var i = 0; i < data.length; i++) {
                    dataJson[i] = JSON.parse(data[i]);
                }
            } catch (e) {

            }

            resolve(data);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            // if (['abort', 'canceled'].indexOf(jqXHR.statusText || textStatus) === -1) {
            // }
            showAPIError('getModels', jqXHR.responseJSON || jqXHR.responseText);
            reject(jqXHR);
        });
    });

    return promise;
}

async function getModel(modelName, modelId) {
    // params = params || {};
    
    modelId = tryParseInt(modelId, null);
    
    if (!modelName) {
        alert('No modelName name in getModels');
        return;
    }

    if (!modelId) {
        alert('No modelId supplied in getModels');
        return;
    }
    
    var jqXHR = $.ajax({
        type: 'POST'
        , async: true
        , url: APISettings.apiBaseUrl + 'getmodel'
        , headers: { "X-CSRFToken": APISettings.csrf_token }
        , xhrFields: {}
        , data: JSON.stringify({
            modelName: modelName
            , modelId: modelId
            // , params: params
        })
        , contentType: 'application/json; charset=utf-8'
    });

    var promise = new Promise(function (resolve, reject) {
        jqXHR.done(function (data, textStatus, jqXHR) {
            //parse JSON object
            dataJson = data;
            try {
                dataJson = JSON.parse(data);
            } catch (e) {

            }
            resolve(dataJson);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            // if (['abort', 'canceled'].indexOf(jqXHR.statusText || textStatus) === -1) {
            // }
            showAPIError('getModel', jqXHR.responseJSON || jqXHR.responseText);
            reject(jqXHR);
        });
    });

    return promise;
}

async function createModel(modelName, attributes) {
    attributes = attributes || {};
    
    if (!modelName) {
        alert('No modelName name in getModels');
        return;
    }
    
    var jqXHR = $.ajax({
        type: 'POST'
        , async: true
        , url: APISettings.apiBaseUrl + 'createmodel'
        , headers: { "X-CSRFToken": APISettings.csrf_token }
        , xhrFields: {}
        , data: JSON.stringify({
            modelName: modelName
            , attributes: attributes
        })
        , contentType: 'application/json; charset=utf-8'
    });

    var promise = new Promise(function (resolve, reject) {
        jqXHR.done(function (data, textStatus, jqXHR) {
            //parse JSON object
            dataJson = data;
            try {
                dataJson = JSON.parse(data);
            } catch (e) {

            }
            resolve(dataJson);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            // if (['abort', 'canceled'].indexOf(jqXHR.statusText || textStatus) === -1) {
            // }
            showAPIError('createModel', jqXHR.responseJSON || jqXHR.responseText);
            reject(jqXHR);
        });
    });

    return promise;
}

async function deleteModel(modelName, modelId) {
    // params = params || {};
    
    modelId = tryParseInt(modelId, null);
    
    if (!modelName) {
        alert('No modelName name in getModels');
        return;
    }

    if (!modelId) {
        alert('No modelId supplied in getModels');
        return;
    }
    
    var jqXHR = $.ajax({
        type: 'POST'
        , async: true
        , url: APISettings.apiBaseUrl + 'deletemodel'
        , headers: { "X-CSRFToken": APISettings.csrf_token }
        , xhrFields: {}
        , data: JSON.stringify({
            modelName: modelName
            , modelId: modelId
        })
        , contentType: 'application/json; charset=utf-8'
    });

    var promise = new Promise(function (resolve, reject) {
        jqXHR.done(function (data, textStatus, jqXHR) {
            resolve(null);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            // if (['abort', 'canceled'].indexOf(jqXHR.statusText || textStatus) === -1) {
            // }
            alert(jqXHR.responseJSON || jqXHR.responseText);
            reject(jqXHR);
        });
    });

    return promise;
}

async function updateModel(modelName, modelId, attributes) {
    attributes = attributes || {};
    
    modelId = tryParseInt(modelId, null);
    
    if (!modelName) {
        alert('No modelName name in getModels');
        return;
    }

    if (!modelId) {
        alert('No modelId supplied in getModels');
        return;
    }
    
    var jqXHR = $.ajax({
        type: 'POST'
        , async: true
        , url: APISettings.apiBaseUrl + 'updatemodel'
        , headers: { "X-CSRFToken": APISettings.csrf_token }
        , xhrFields: {}
        , data: JSON.stringify({
            modelName: modelName
            , modelId: modelId
            , attributes: attributes
        })
        , contentType: 'application/json; charset=utf-8'
    });

    var promise = new Promise(function (resolve, reject) {
        jqXHR.done(function (data, textStatus, jqXHR) {
            resolve(null);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            // if (['abort', 'canceled'].indexOf(jqXHR.statusText || textStatus) === -1) {
            // }
            showAPIError('updateModel', jqXHR.responseJSON || jqXHR.responseText);
            reject(jqXHR);
        });
    });

    return promise;
}

async function updateModelField(modelName, modelId, attributeName, attributeValue) {
    if (!attributeName) {
        alert('No attributeName name in updateModel');
        return;
    }

    if (attributeValue === undefined) {
        alert('No attributeValue supplied in updateModel');
        return;
    }

    var attributes = {}
    attributes[attributeName] = attributeValue;

    return await updateModel(modelName, modelId, attributes); 
}

async function executeModelMethod(modelName, methodName, methodParams) {
    methodParams = methodParams || {};
    
    if (!modelName) {
        alert('No modelName name in executeModelMethod');
        return;
    }
    
    var jqXHR = $.ajax({
        type: 'POST'
        , async: true
        , url: APISettings.apiBaseUrl + 'executemodelmethod'
        , headers: { "X-CSRFToken": APISettings.csrf_token }
        , xhrFields: {}
        , data: JSON.stringify({
            modelName: modelName
            , methodName: methodName
            , methodParams: methodParams
        })
        , contentType: 'application/json; charset=utf-8'
    });

    var promise = new Promise(function (resolve, reject) {
        jqXHR.done(function (data, textStatus, jqXHR) {
            dataJson = data;
            try {
                dataJson = JSON.parse(data);
            } catch (e) {

            }
            resolve(dataJson);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            // if (['abort', 'canceled'].indexOf(jqXHR.statusText || textStatus) === -1) {
            // }
            showAPIError('executeModelMethod', jqXHR.responseJSON || jqXHR.responseText);
            reject(jqXHR);
        });
    });

    return promise;
}

function dateToServer(clientDate) {
    var d = new Date(clientDate);
    month = '' + (d.getMonth() + 1);
    day = '' + d.getDate();
    year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function dateFromServer(serverDate) {
    var d = new Date(serverDate);
    d.setDate(d.getDate() + 1);
    month = '' + (d.getMonth() + 1);
    day = '' + d.getDate();
    year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [month, day, year].join('/');
}

$.fn.setTextOrValue = function (val) {
    var $item = $(this);
    if ($item.is('input, textarea, select')) {
        $item.val(val);
    } else {
        $item.text(val);
    }
}

$.fn.dataRepeater = function (options) {
    options = options || {};
    data = options.data || [];
    
    //load container and itemtemplate
    $container = $(this);
    $itemTemplate = $(this).find('[rp-itemtemplate]');
    $headerTempalte = $(this).find('[rp-headertemplate]');
    $bodyTemplate = $(this).find('[rp-bodytemplate]');
    $bodyTemplate.empty();
    if ($itemTemplate.length === 0) {
        console.warn('Unable to bind dataRepeater, no item template');
    }

    $container.data('itemTemplate:dataRepeater', $itemTemplate.prop('outerHTML'));
    $container.data('headerTemplate:dataRepeater', $headerTempalte.prop('outerHTML'));
    $container.data('bodyTemplate:dataRepeater', $bodyTemplate.prop('outerHTML'));

    $container.empty();

    var data = options.data || [];

    var $header = $($container.data('headerTemplate:dataRepeater'));
    var $body = $($container.data('bodyTemplate:dataRepeater'));
    var $item = $($container.data('itemTemplate:dataRepeater'));

    if ($header.length) {
        $container.append($header);
    }

    if ($body.length) {
        $container.append($body);
    }
    
    for (var i = 0; i < data.length; i++) {
        var $thisItemTemplate = $item.clone();
        $thisItemTemplate.find('[rp-field]').each(function () {
            var dataObj = data[i] || {};
            var $field = $(this);
            var fieldname = $field.attr('rp-field');

            var fieldValue = dataObj[fieldname];
            if (fieldValue) {
                $field.setTextOrValue(fieldValue);
            }
        });
        $body.append($thisItemTemplate);
    }
}