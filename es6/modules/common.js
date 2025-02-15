const wrapper = require("../module-wrapper.js");
const filetypes = require("../filetypes.js");

const coreContentType =
	"application/vnd.openxmlformats-package.core-properties+xml";
const appContentType =
	"application/vnd.openxmlformats-officedocument.extended-properties+xml";
const customContentType =
	"application/vnd.openxmlformats-officedocument.custom-properties+xml";
const settingsContentType =
	"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml";

const commonContentTypes = [
	settingsContentType,
	coreContentType,
	appContentType,
	customContentType,
];

class Common {
	constructor() {
		this.name = "Common";
	}
	getFileType({ doc }) {
		const { invertedContentTypes } = doc;
		if (!invertedContentTypes) {
			return;
		}
		const keys = Object.keys(filetypes);
		let ftCandidate;
		for (let i = 0, len = keys.length; i < len; i++) {
			const contentTypes = filetypes[keys[i]];
			for (let j = 0, len2 = contentTypes.length; j < len2; j++) {
				const ct = contentTypes[j];
				if (invertedContentTypes[ct]) {
					ftCandidate = keys[i];
					Array.prototype.push.apply(doc.targets, invertedContentTypes[ct]);
				}
			}
		}
		for (let j = 0, len2 = commonContentTypes.length; j < len2; j++) {
			const ct = commonContentTypes[j];
			if (invertedContentTypes[ct]) {
				Array.prototype.push.apply(doc.targets, invertedContentTypes[ct]);
			}
		}
		return ftCandidate;
	}
}
module.exports = () => wrapper(new Common());
