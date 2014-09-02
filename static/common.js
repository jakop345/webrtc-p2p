
var common = (function () {


    /**
    * Create the Native Client <embed> element as a child of the DOM element
    * named "listener".
    *
    * @param {string} name The name of the example.
    * @param {string} tool The name of the toolchain, e.g. "glibc", "newlib" etc.
    * @param {string} path Directory name where .nmf file can be found.
    * @param {number} width The width to create the plugin.
    * @param {number} height The height to create the plugin.
    * @param {Object} attrs Dictionary of attributes to set on the module.
    */

    function createNaClModule(name, tool, path, width, height ) {
        var moduleEl = document.createElement('embed');
        moduleEl.setAttribute('name', 'nacl_module');
        moduleEl.setAttribute('id', 'nacl_module');
        moduleEl.setAttribute('width', width);
        moduleEl.setAttribute('height', height);
        moduleEl.setAttribute('path', path);
        moduleEl.setAttribute('src', path + '/' + name + '.nmf');
        var mimetype = 'application/x-ppapi-debug';
        moduleEl.setAttribute('type', mimetype);

        // The <EMBED> element is wrapped inside a <DIV>, which has both a 'load'
        // and a 'message' event listener attached.  This wrapping method is used
        // instead of attaching the event listeners directly to the <EMBED> element
        // to ensure that the listeners are active before the NaCl module 'load'
        // event fires.
        var listenerDiv = document.getElementById('listener');
        listenerDiv.appendChild(moduleEl);

            window.setTimeout(function () {
                moduleEl.readyState = 1;
                moduleEl.dispatchEvent(new CustomEvent('loadstart'));
                moduleEl.readyState = 4;
                moduleEl.dispatchEvent(new CustomEvent('load'));
                moduleEl.dispatchEvent(new CustomEvent('loadend'));
            }, 100);  // 100 ms

    }

    /**
    * Add the default "load" and "message" event listeners to the element with
    * id "listener".
    *
    * The "load" event is sent when the module is successfully loaded. The
    * "message" event is sent when the naclModule posts a message using
    * PPB_Messaging.PostMessage() (in C) or pp::Instance().PostMessage() (in
    * C++).
    */
    function attachDefaultListeners() {
        var listenerDiv = document.getElementById('listener');
        listenerDiv.addEventListener('load', moduleDidLoad, true);
        listenerDiv.addEventListener('message', handleMessage, true);
        //listenerDiv.addEventListener('error', handleError, true);
        //listenerDiv.addEventListener('crash', handleCrash, true);
        if (typeof window.attachListeners !== 'undefined') {
            window.attachListeners();
        }
    }




    /**
    * Called when the NaCl module is loaded.
    *
    * This event listener is registered in attachDefaultListeners above.
    */
    function moduleDidLoad() {
        common.naclModule = document.getElementById('nacl_module');
        if (typeof window.moduleDidLoad !== 'undefined') {
            window.moduleDidLoad();
        }
    }

    /**
    * Hide the NaCl module's embed element.
    *
    * We don't want to hide by default; if we do, it is harder to determine that
    * a plugin failed to load. Instead, call this function inside the example's
    * "moduleDidLoad" function.
    *
    */
    function hideModule() {
        // Setting common.naclModule.style.display = "None" doesn't work; the
        // module will no longer be able to receive postMessages.
        common.naclModule.style.height = '0';
    }
    /**
    * Remove the NaCl module from the page.
    */
    function removeModule() {
        common.naclModule.parentNode.removeChild(common.naclModule);
        common.naclModule = null;
    }

    /**
    * Return true when |s| starts with the string |prefix|.
    *
    * @param {string} s The string to search.
    * @param {string} prefix The prefix to search for in |s|.
    */
    function startsWith(s, prefix) {
        // indexOf would search the entire string, lastIndexOf(p, 0) only checks at
        // the first index. See: http://stackoverflow.com/a/4579228
        return s.lastIndexOf(prefix, 0) === 0;
    }

    /** Maximum length of logMessageArray. */
    var kMaxLogMessageLength = 20;

    /** An array of messages to display in the element with id "log". */
    var logMessageArray = [];



    /**
    * Add a message to an element with id "log".
    *
    * This function is used by the default "log:" message handler.
    *
    * @param {string} message The message to log.
    */
    function logMessage(message) {
        logMessageArray.push(message);
        if (logMessageArray.length > kMaxLogMessageLength)
            logMessageArray.shift();

        document.getElementById('log').textContent = logMessageArray.join('\n');
        console.log(message);
    }

    /**
    */
    var defaultMessageTypes = {
        'alert': alert,
        'log': logMessage
    };

    /**
    * Called when the NaCl module sends a message to JavaScript (via
    * PPB_Messaging.PostMessage())
    *
    * This event listener is registered in createNaClModule above.
    *
    * @param {Event} message_event A message event. message_event.data contains
    *     the data sent from the NaCl module.
    */
    function handleMessage(message_event) {
        if (typeof message_event.data === 'string') {
            for (var type in defaultMessageTypes) {
                if (defaultMessageTypes.hasOwnProperty(type)) {
                    if (startsWith(message_event.data, type + ':')) {
                        func = defaultMessageTypes[type];
                        func(message_event.data.slice(type.length + 1));
                        return;
                    }
                }
            }
        }

        if (typeof window.handleMessage !== 'undefined') {
            window.handleMessage(message_event);
            return;
        }

        logMessage('Unhandled message: ' + message_event.data);
    }

    /**
    * Called when the DOM content has loaded; i.e. the page's document is fully
    * parsed. At this point, we can safely query any elements in the document via
    * document.querySelector, document.getElementById, etc.
    *
    * @param {string} name The name of the example.
    * @param {string} tool The name of the toolchain, e.g. "glibc", "newlib" etc.
    * @param {string} path Directory name where .nmf file can be found.
    * @param {number} width The width to create the plugin.
    * @param {number} height The height to create the plugin.
    * @param {Object}  attrsOptional dictionary of additional attributes.
    */
    function domContentLoaded(name, tool, path, width, height) {

        if (common.naclModule == null) {
            // We use a non-zero sized embed to give Chrome space to place the bad
            // plug-in graphic, if there is a problem.
            width = typeof width !== 'undefined' ? width : 200;
            height = typeof height !== 'undefined' ? height : 200;
            attachDefaultListeners();
            createNaClModule(name, tool, path, width, height);
        } 
    }

    // The symbols to export.
    return {
        /** A reference to the NaCl module, once it is loaded. */
        naclModule: null,
        attachDefaultListeners: attachDefaultListeners,
        domContentLoaded: domContentLoaded,
        createNaClModule: createNaClModule,
        hideModule: hideModule,
        removeModule: removeModule,
        logMessage: logMessage
    };

} ());

// Listen for the DOM content to be loaded. This event is fired when parsing of
// the page's document has finished.
document.addEventListener('DOMContentLoaded', function () {

    var loadFunction = common.domContentLoaded;
    
    var name = "test1";
    var tc = 'win';
    var path = 'win/debug';
    var w = 200, h = 200;

    loadFunction(name, tc, path, w, h);

});
