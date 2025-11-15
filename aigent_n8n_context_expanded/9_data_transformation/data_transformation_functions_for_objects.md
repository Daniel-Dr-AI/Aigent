# Data transformation functions for objects

**Source:** https://docs.n8n.io/code/builtin/data-transformation-functions/objects/

---

# Objects

A reference document listing built-in convenience functions to support data transformation in expressions for objects.

JavaScript in expressions

You can use any JavaScript in expressions. Refer to [Expressions](../../../expressions/) for more information.

### isEmpty(): Boolean

Checks if the Object has no key-value pairs.


### merge(object: Object): Object

Merges two Objects into a single Object using the first as the base Object. If a key exists in both Objects, the key in the base Object takes precedence.

#### Function parameters

objectRequiredObject

The Object to merge with the base Object.


### hasField(fieldName: String): Boolean

Checks if the Object has a given field. Only top-level keys are supported.

#### Function parameters

fieldNameRequiredString

The field to search for.


### removeField(key: String): Object

Removes a given field from the Object

#### Function parameters

keyRequiredString

The field key of the field to remove.


### removeFieldsContaining(value: String): Object

Removes fields with a given value from the Object.

#### Function parameters

valueRequiredString

The field value of the field to remove.


### keepFieldsContaining(value: String): Object

Removes fields that do not match the given value from the Object.

#### Function parameters

valueRequiredString

The field value of the field to keep.


### compact(): Object

Removes empty values from an Object.


### toJsonString(): String

Convert an object to a JSON string. Equivalent of `JSON.stringify`.


### urlEncode(): String

Transforms an Object into a URL parameter list. Only top-level keys are supported.
