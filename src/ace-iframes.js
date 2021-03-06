/*
 * ace.js
 * Copyright (C) 2015 tox <tox@rootkit>
 *
 * Distributed under terms of the MIT license.
 *
 * Edited from https://github.com/Gottox/reveal.js-ace
 * Modified to:
 * - load scripts from node_modules
 * - add gutter width override
 * - set padding & scroll margins
 */


var RevealAce = window.RevealAce || (function() {
	if(!Reveal.ace) Reveal.ace = {};
	function extend(o) {
		for(var i = 1; i < arguments.length; i++)
			for(var key in arguments[i])
				o[key] = arguments[i][key];
		return o;
	};
	function mkEditor(iframe) {
		var w = iframe.contentWindow, d = w.document;
		var mode = iframe.dataset.mode;
		d.write("<!DOCTYPE html><html>"+
			"<head>"+
			"<script src='./node_modules/ace-builds/src-noconflict/ace.js' type='text/javascript' charset='utf-8'></script>"+
			"<style>"+
			".ace_gutter-cell { padding-left: 3px!important; }"+
			".ace-ambiance span.ace_comment { color: #8e8e8e; }"+
			"</style>"
		);
		if (mode) {
			d.write("<script src='./node_modules/ace-builds/src-noconflict/mode-" + mode + ".js' type='text/javascript' charset='utf-8'></script>");
		}
		d.write("</head>"+
			"<body>"+
			"<div id='editor' style='position:absolute; left:0; top:0; bottom:0; right:0;'>" +
			iframe.innerHTML.trim()+ // innerHTML is already escaped
			"</div>"+
			"</body>"+
			"</html>");
		iframe.onload = function() {
			function slidechanged(event) {
				var e = iframe;
				for(var e = iframe; e && e != event.currentSlide; e = e.parentNode);
				if(!e)
					return;
				iframe.focus();
				editor.focus();
			}
			var editor = w.ace.edit(d.getElementById('editor'));
			var aceConf = extend({}, options, iframe.dataset);
			editor.setOptions(aceConf);

			if (mode) {
				var fetched_mode = w.ace.require("ace/mode/" + mode).Mode;
				editor.session.setMode(new fetched_mode());
			}

			// Configuration
			if(aceConf.theme)
				// editor.setTheme(aceConf.theme);
			if(aceConf.mode)
				editor.getSession().setMode(aceConf.mode);
			if(aceConf.autoFocus) {
				Reveal.addEventListener('slidechanged', slidechanged);
				slidechanged({ currentSlide: Reveal.getCurrentSlide() })
			}
			editor.renderer.setPadding(15);
			editor.renderer.setScrollMargin(15);

			// Events
			if(options.oninit)
				options.oninit.call(editor, editor);
			if(iframe.dataset.oninit)
				(new Function("editor", iframe.dataset.oninit)).call(editor, editor);
			if(options.onchange)
				editor.getSession().on('change', options.onchange);
			if(iframe.dataset.onchange) {
				var onchange = new Function("value", "editor", iframe.dataset.onchange);
				editor.getSession().on('change', function() {
					var value = editor.getValue();
					return onchange.call(editor, value, editor);
				});
			}
			if(iframe.id) {
				Reveal.ace[iframe.id] = editor;
			}
		};
		d.close();
	}

	var module = {};
	var config = Reveal.getConfig();
	var options = extend({
		className: "ace",
		autoFocus: false,
		onchange: null,
		oninit: null
	}, config.ace || {});

	var aces = document.getElementsByClassName(options.className);
	for(var i = 0; i < aces.length; i++) {
		if(!aces[i].contentWindow) {
			console.warn("ACE Editors must be embedded in an IFrame");
			continue;
		}
		mkEditor(aces[i]);
	}

	return module;
})();
