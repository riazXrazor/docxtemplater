const traits = require("../traits.js");
const { isContent } = require("../doc-utils.js");
const {
	throwRawTagShouldBeOnlyTextInParagraph,
	getInvalidRawXMLValueException,
} = require("../errors.js");

const moduleName = "rawxml";
const wrapper = require("../module-wrapper.js");

function getInner({ part, left, right, postparsed, index }) {
	const paragraphParts = postparsed.slice(left + 1, right);
	paragraphParts.forEach(function (p, i) {
		if (i === index - left - 1) {
			return;
		}
		if (isContent(p)) {
			throwRawTagShouldBeOnlyTextInParagraph({ paragraphParts, part });
		}
	});
	return part;
}

class RawXmlModule {
	constructor() {
		this.name = "RawXmlModule";
		this.prefix = "@";
	}
	optionsTransformer(options, docxtemplater) {
		this.fileTypeConfig = docxtemplater.fileTypeConfig;
		return options;
	}
	matchers() {
		return [[this.prefix, moduleName]];
	}
	postparse(postparsed) {
		return traits.expandToOne(postparsed, {
			moduleName,
			getInner,
			expandTo: this.fileTypeConfig.tagRawXml,
			error: {
				message: "Raw tag not in paragraph",
				id: "raw_tag_outerxml_invalid",
				explanation: (part) =>
					`The tag "${part.value}" is not inside a paragraph, putting raw tags inside an inline loop is disallowed.`,
			},
		});
	}
	render(part, options) {
		if (part.module !== moduleName) {
			return null;
		}
		let value;
		const errors = [];
		try {
			value = options.scopeManager.getValue(part.value, { part });
			if (value == null) {
				value = options.nullGetter(part);
			}
		} catch (e) {
			errors.push(e);
			return { errors };
		}
		value = value ? value : "";
		if (typeof value === "string") {
			return { value };
		}
		return {
			errors: [
				getInvalidRawXMLValueException({
					tag: part.value,
					value,
					offset: part.offset,
				}),
			],
		};
	}
}

module.exports = () => wrapper(new RawXmlModule());
