// The backend API interface:
window.BACKEND_API = ((function( AUTH_OPS, DB_OPS, UTILS, logger ) {
    var _obj = {};
    var _logger = logger( "BACKEND_API" );

    // User operations:
    _obj[ "users" ] = {
        login: function( email, password ) {
            /**
             * Queries the email & password with the db:
             *     - Returns user db object if values are correct
             *     - Returns error object if values are incorrect
             *     - Adds user info to the current auth session
             **/
            _logger.info( "users.login" );
            return AUTH_OPS.loginUser({ email: email, password: password });
        },
        signup: function( username, email, password ) {
            /**
             * Adds the user info in database:
             *     - Returns user db object
             *     - Returns error object if email is not unique
             *     - Adds user info to the current auth session
             **/
            _logger.info( "users.signup" );
            return AUTH_OPS.signupUser({ username: username, email: email, password: password });
        },
        logout: function() {
            /**
             * Logs the current user out
             *     - Returns success obj
             **/
            _logger.info( "users.logout" );
            return AUTH_OPS.logoutUser();
        },
        getCurrentUserEmailFromSession: function() {
            /**
             * Returns the email address of the user currently logged-in, otherwise undefined
             **/
            _logger.info( "users.getCurrentUserEmailFromSession" );
            return AUTH_OPS.getCurrentUserEmail();
        },
        getCurrentUserInfoFromDb: function() {
            /**
             * Returns the email address of the user currently logged-in, otherwise undefined
             **/
            _logger.info( "users.getCurrentUserInfoFromDb" );

            var currentUserEmail = this.getCurrentUserEmailFromSession();

            if( !currentUserEmail ) {
                _logger.info( "The user is not logged in" );
                return window.Promise.resolve( { message: "The user is not logged in" } );
            }

            _logger.info( "currentUserEmail: " + currentUserEmail );

            return DB_OPS.get( "users/" + UTILS.formatEmailAsKey( currentUserEmail ) );
        },
        getByEmail: function( email ) {
            /**
             * Returns the email address of the user currently logged-in, otherwise undefined
             **/
            _logger.info( "users.getByEmail " + email );

            return DB_OPS.get( "users/" + UTILS.formatEmailAsKey( email ) );
        },
        getAll: function() {
            /**
             * Returns the email address of the user currently logged-in, otherwise undefined
             **/
            _logger.info( "users.getAll" );

            return DB_OPS.get( "users/" )
                .then( function( response ) {
                    return Object.keys( response ).map( function( k ) {
                        return response[ k ];
                    });
                });
        },
        modifyCurrentUser: function( updateObj ) {
            /**
             * Modifies the current user
             *     - Returns success obj
             **/

            var _chain = window.Promise.resolve( {} ).then( function( o ) { return o; } );

            _logger.info( "users.modifyCurrentUser" );

            if( !AUTH_OPS.getCurrentUserEmail( true ) ) {
                _logger.info( "User info not found in session, could not modify user" );

                return _chain.then( function() {
                    return { message: "User info not in session, could not modify" };
                });
             }

            _logger.info( "updateObj: " + JSON.stringify( updateObj, null, 4 ) );

            Object.keys( updateObj ).forEach( function( k ) {

                // Handle password update:
                if( k === "password" ) {
                    AUTH_OPS.updateCurrentUserPassword( updateObj[ k ] );
                }

                _chain = _chain.then( function() {
                    var _p = DB_OPS.updateValue( "users/" + AUTH_OPS.getCurrentUserEmail( true ) + "/" + k, updateObj[ k ] );

                    // Also update email in the session:
                    if( k === "email" ) {
                        _p = _p.then( function() {
                            return AUTH_OPS.updateCurrentUserEmail( updateObj[ k ] );
                        });
                    }

                    return _p;
                });
            });

            return _chain;
        },
        removeCurrentUser: function() {
            /**
             * Removes the current user
             *     - Returns success obj
             **/
            return AUTH_OPS.removeUser();
        }
    };

    // Recipe operations:
    _obj[ "recipe" ] = {
        add: function( recipeName ) {}
    };

    return _obj;
})( window.AUTH_OPS, window.DB_OPS, window.UTILS, window.LOGGER ));