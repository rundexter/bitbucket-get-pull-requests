var _ = require('lodash'),
    util = require('./util.js');

var request = require('request').defaults({
        baseUrl: 'https://api.bitbucket.org/2.0/'
    }),
    pickInputs = {
        'owner': { key: 'owner', validate: { req: true } },
        'repo_slug': { key: 'repo_slug', validate: { req: true } },
        'state': 'state'
    },
    pickOutputs = {
        '-': {
            key: 'values',
            fields: {
                'id': 'id',
                'state': 'state',
                'title': 'title',
                'description': 'description',
                'url': 'links.self.href',
                'author': 'author.username',
                'repository': 'destination.repository.name',
                'branch': 'destination.branch.name'
            }
        }
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var credentials = dexter.provider('bitbucket').credentials(),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        // check params.
        if (validateErrors)
            return this.fail(validateErrors);

        var uriLink = 'repositories/' + inputs.owner + '/' + inputs.repo_slug + '/pullrequests';
        //send API request
        request.get({
            uri: uriLink,
            qs: _.pick(inputs, 'state'),
            oauth: credentials,
            json: true
        }, function (error, response, body) {
            if (error || (body && body.error))
                this.fail(error || body.error);
            else if (typeof body === 'string')
                this.fail('Status code: ' + response.statusCode);
            else
                this.complete(util.pickOutputs(body, pickOutputs) || {});
        }.bind(this));
    }
};
