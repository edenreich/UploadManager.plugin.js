
/*
|--------------------------------------------------------------------------
| UploadManager Plugin JS
|--------------------------------------------------------------------------
| This plugin creates an Upload Manager
| 
|
*/

(function()
{

	var settings = {};
	
	var dropBox = {};	
	
	var dropBoxTitle = {};

	var uploadListItems = [];
	
	var fileInput = {};
	
	var chooseButton = {};
	
	var container = {};

	// The constructor
	this.UploadManager = function() {

		this.timeOut = null;

		var defaults = {
			dragAndDrop: false,
			dropBoxTitle: 'Drag Images Here..',
			containerWidth: 'auto',
			containerHeight: 200,
			attachTo: '.upload',
			timeOut: 3000,
			buttonOnThe: 'right',
			buttonInnerText: 'Choose',
			URL: 'Upload.php',
			autoStart: false,
			callbackAjaxResponse: function(response) {},
		}

		settings = defaults;

		if(arguments[0] && typeof arguments[0] === "object") {

			settings = extendDefaults(defaults, arguments[0]);	
		}
	}

	

	// This method create the upload manager and attach it to the selected element
	UploadManager.prototype.attachTo = function(div) {

		container = document.querySelector(div);

		if(settings.dragAndDrop)
		{
			dropBox = createDropBox();

			container.appendChild(dropBox);
			dropBox.ondrop = listFiles;
		}

		fileInput = createFileInput();
		chooseButton = createButton(settings);
		
		chooseButton.onclick = openFilesDialogBox;
		fileInput.onchange = listFiles;

		container.appendChild(fileInput);
		container.appendChild(chooseButton);
	}

	// This method creates the drag and drop box
	function createDropBox() {

		dropBox = document.createElement('div');
		dropBox.className = 'drop-box';
		dropBox.style.width = settings.containerWidth+'px';
		dropBox.style.height = settings.containerHeight+'px';
		dropBox.style.border = '2px dotted #a6a6a6';
		dropBox.style.textAlign = 'center';
		dropBox.style.margin = '0 auto';

		dropBoxTitle = document.createElement('span');
		dropBoxTitle.innerHTML = settings.dropBoxTitle;
		dropBoxTitle.style.lineHeight = settings.containerHeight+'px';
		dropBoxTitle.style.fontSize = '1.6em';
		dropBoxTitle.style.color = '#a6a6a6';

		dropBox.appendChild(dropBoxTitle);
		
		dropBox.ondragover = changeDropBoxStyle;
		dropBox.ondragleave = changeDropBoxStyle;
		

		return dropBox;
	}

	// This function creates the input invisible for the files
	function createFileInput() {

		var input = document.createElement('input');

		input.type = 'file';
		input.name = 'file[]';
		input.style.visibility = 'hidden';
		input.id = 'fileInput';
		input.multiple = true;

		return input;
	}

	// This function creates the upload button
	function createButton(options) {
		
		var button = document.createElement('button');
		
		button.style.display = 'inline-block';
		button.style.padding = '8px 12px';
		button.style.fontSize = '14px';
		button.style.fontWeight = '400';
		button.style.textAlign = 'center';
		button.style.whiteSpace = 'nowrap';
		button.style.verticalAlign = 'middle';
		button.style.userSelect = 'none';
		button.style.backgroundImage = 'none';
		button.style.border = '1px solid transparent';
		button.style.cursor = 'pointer';
		button.style.marginLeft = '10px';
		button.style.marginRight = '10px';
		button.style.backgroundColor = '#257C8A';
		
		if(options.hasOwnProperty('name'))
			button.name = options.name;

		if(options.hasOwnProperty('buttonInnerText'))
			button.innerHTML = options.buttonInnerText;

		if(options.hasOwnProperty('color'))
			button.style.backgroundColor = options.color;

		if(options.hasOwnProperty('buttonOnThe'))
			button.style.float = options.buttonOnThe;

		return button;
	}

	// List the files to be uploaded
	function listFiles(files) {

		event.preventDefault();

		if(event.type == 'change') {

			files = event.target.files;
		}
		else if(event.type == 'drop') {

			dropBox.style.border = '2px dotted #a6a6a6';
			dropBoxTitle.style.color = '#a6a6a6';
			files = event.dataTransfer.files;
		}

		for(var i = 0; i < files.length ; i++) {

			var uploadItem = listFile(files[i]);

			uploadListItems.push(uploadItem);
		}

		for(var i = 0; i < uploadListItems.length; i++)
		{
			container.appendChild(uploadListItems[i]);

			if(settings.autoStart)
				processFile(files[i], uploadListItems[i]);
		}


		
		return false;
	}

	// This function wrap the file inside a list item
	function listFile(file) {
		
		var list = document.createElement('li');

		var removeButton = createButton({
								color: '#d9534f', 
								buttonInnerText: 'Remove',
								buttonOnThe: 'right',
								name: 'removeButton',
							});

		var uploadButton = createButton({
								color: '#257C8A', 
								buttonInnerText: 'Upload',
								buttonOnThe: 'right',
							});

		list.style.width = '98%';
		list.style.height = '40px';
		list.style.lineHeight = '35px';
		list.style.padding = '6px 6px';
		list.style.border = '1px solid #a6a6a6';
		list.style.listStyleType = 'none';
		list.style.marginTop = '5px';
		list.style.display = 'inline-block';

		var reader = new FileReader();
		var preview = document.createElement('img');

		preview.style.height = '40px';
		preview.style.width = '40px';
		preview.style.verticalAlign = 'middle';
		preview.style.marginRight = '10px';

		reader.onload = function() {
				
			preview.src = this.result;

		};

		if(file)
		    reader.readAsDataURL(file);		
		else
			preview.src = "";

		var fileName = document.createElement('span');
		fileName.innerHTML = file.name;

		if(!settings.autoStart) {
			
			list.appendChild(preview);		
			list.appendChild(fileName);
			list.appendChild(uploadButton);
			list.appendChild(removeButton);
		
			removeButton.onclick = removeItem;
			uploadButton.onclick = processFile;
			uploadButton.file = file;
		} 

		return list;
	}


	// Event Listeners

	// This function changes the color of the drop box
	function changeDropBoxStyle(event) {
		
		event.preventDefault();

		if(event.type == "dragover") {

			dropBox.style.border = '2px dotted #000000'
			dropBoxTitle.style.color = '#000000';
		
		} else if(event.type == "dragleave") {

			dropBox.style.border = '2px dotted #a6a6a6';
			dropBoxTitle.style.color = '#a6a6a6';
		}
	}

	// This function processes the files
	function processFiles(event) {

		var files = event.target.files;
		
		console.log(files);
		// var uploadListItem = this.parentNode;
		// var progressBar = document.createElement('progress');
		// var ajax = getXMLHttpRequestObject();
		// var fd = new FormData();

		// progressBar.value = '0';
		// progressBar.style.width = '100%';
		// progressBar.style.height = '100%';
		// progressBar.max = '100';
		
		// fd.append('file', file);

		// empty(uploadListItem);

		// uploadListItem.append(progressBar);

		// ajax.upload.onprogress = updateProgressBar;
		// ajax.upload.progressBar = progressBar;

		// ajax.open('post', settings.URL);
		
		// ajax.onreadystatechange = getAjaxResponse;
		// ajax.progressBar = progressBar;
		// ajax.uploadListItem = uploadListItem;

		// ajax.send(fd);
	}

	// This function processes the files
	function processFile(event, node) {

		if(event.type == 'click') {

			var uploadListItem = this.parentNode;
			var file = event.target.file;
		
		} else {

			var uploadListItem = node;
			var file = event;
		} 
			
		
		var progressBar = document.createElement('progress');
		var ajax = getXMLHttpRequestObject();
		var fd = new FormData();

		progressBar.value = '0';
		progressBar.style.width = '100%';
		progressBar.style.height = '100%';
		progressBar.max = '100';
		
		fd.append('file', file);

		empty(uploadListItem);

		uploadListItem.append(progressBar);

		ajax.upload.onprogress = updateProgressBar;
		ajax.upload.progressBar = progressBar;

		ajax.open('post', settings.URL);
		
		ajax.onreadystatechange = getAjaxResponse;
		ajax.progressBar = progressBar;
		ajax.uploadListItem = uploadListItem;

		ajax.send(fd);
	}

	// This function update the file upload progressbar
	function updateProgressBar(event) {

		if(event.lengthComputable) {
		 	
			var percentComplete = Math.ceil((event.loaded / event.total) * 100);

			if(percentComplete < 98)
		    	this.progressBar.value = percentComplete;
		   
		  } else {
		    
		    throw new Error('Unable to get the progress of the file. Filesize is unknown.')
		  
		  }

	}

	// This function handles the response from the server side script
	function getAjaxResponse() {

		var ajax = this;

		if(ajax.readyState == 4 && ajax.status == 200) {
		
			for(var i = 95; i <= 100 ; i++)
				ajax.progressBar.value = i;
			
			setTimeout(function() {
				ajax.uploadListItem.remove();
				uploadListItems.pop(ajax.uploadListItem);
			}, 1000);

			settings.callbackAjaxResponse.call(this, this.response);
		}
	}

	// This function opens the files dialog box
	function openFilesDialogBox() {

		document.getElementById('fileInput').click();
	}

	// This function depends on the browser type returns the XMLHttpRequest object.
	function getXMLHttpRequestObject() {

	    if (window.XMLHttpRequest) {

	        return new window.XMLHttpRequest;

	    }
	    else if (window.ActiveXObject) {
	        
	        return new ActiveXObject("MSXML2.XMLHTTP.3.0");

	    } else {

	    	throw new Error('This browser does not support ajax');

	    }
	}


	// helper functions

	// remove an item from the upload items
	function removeItem() {

		this.parentNode.remove();
		uploadListItems.pop(this);
	}

	// This function is just for removing all child nodes.
	function empty(node) {
		
		while(node.hasChildNodes()) {

		    node.removeChild(node.lastChild);
		}
	}

	// Extending the default object by letting the object to be overrided if the properties exists.
	function extendDefaults(source, properties) {

		var property;
		
		for(property in properties) {

			if(properties.hasOwnProperty(property)) {
				source[property] = properties[property];
			}
		}

		return source;
	}


}());