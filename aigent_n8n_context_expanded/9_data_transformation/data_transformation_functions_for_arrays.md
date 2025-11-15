# Data transformation functions for arrays

**Source:** https://docs.n8n.io/code/builtin/data-transformation-functions/arrays/

---

# Arrays

A reference document listing built-in convenience functions to support data transformation in [expressions](../../../../glossary/#expression-n8n) for arrays.

JavaScript in expressions

You can use any JavaScript in expressions. Refer to [Expressions](../../../expressions/) for more information.

### average(): Number

Returns the value of elements in an array


### chunk(size: Number): Array

Splits arrays into chunks with a length of size

#### Function parameters

sizeRequiredNumber

The size of each chunk.


### compact(): Array

Removes empty values from the array.


### difference(arr: Array): Array

Compares two arrays. Returns all elements in the base array that aren't present in arr.

#### Function parameters

arrRequiredArray

The array to compare to the base array.


### intersection(arr: Array): Array

Compares two arrays. Returns all elements in the base array that are present in arr.

#### Function parameters

arrRequiredArray

The array to compare to the base array.


### first(): Array item

Returns the first element of the array.


### isEmpty(): Boolean

Checks if the array doesn't have any elements.


### isNotEmpty(): Boolean

Checks if the array has elements.


### last(): Array item

Returns the last element of the array.


### max(): Number

Returns the highest value in an array.


### merge(arr: Array): Array

Merges two Object-arrays into one array by merging the key-value pairs of each element.

#### Function parameters

arrRequiredArray

The array to merge into the base array.


### min(): Number

Gets the minimum value from a number-only array.


### pluck(fieldName?: String): Array

Returns an array of Objects where keys equal the given field names.

#### Function parameters

fieldNameOptionalString

The key(s) you want to retrieve. You can enter as many keys as you want, as comma-separated strings.


### randomItem(): Array item

Returns a random element from an array.


### removeDuplicates(key?: String): Array

Removes duplicates from an array.

#### Function parameters

keyOptionalString

A key, or comma-separated list of keys, to check for duplicates.


### renameKeys(from: String, to: String): Array

Renames all matching keys in the array. You can rename more than one key by entering a series of comma separated strings, in the pattern oldKeyName, newKeyName.

#### Function parameters

fromRequiredString

The key you want to rename.

toRequiredString

The new name.


### smartJoin(keyField: String, nameField: String): Array

Operates on an array of objects where each object contains key-value pairs. Creates a new object containing key-value pairs, where the key is the value of the first pair, and the value is the value of the second pair. Removes non-matching and empty values and trims any whitespace before joining.

#### Function parameters

keyFieldRequiredString

The key to join.

nameFieldRequiredString

The value to join.

#### Example

##### Basic usage

| ``` 1 2 3 4 ``` | ``` // Input {{ [{"type":"fruit", "name":"apple"},{"type":"vegetable", "name":"carrot"} ].smartJoin("type","name") }} // Output [Object: {"fruit":"apple","vegetable":"carrot"}]  ``` |


### sum(): Number

Returns the total sum all the values in an array of parsable numbers.


### toJsonString(): String

Convert an array to a JSON string. Equivalent of `JSON.stringify`.


### union(arr: Array): Array

Concatenates two arrays and then removes duplicate.

#### Function parameters

arrRequiredArray

The array to compare to the base array.


### unique(key?: String): Array

Remove duplicates from an array.

#### Function parameters

keyOptionalString

A key, or comma-separated list of keys, to check for duplicates.
