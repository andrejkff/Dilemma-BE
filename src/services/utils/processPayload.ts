function checkMissingFields(fieldNames: string[], payload: any): string[] {
  const ret: string[] = [];
  fieldNames.forEach(fn => {
    if (payload[fn] === undefined) ret.push(fn);
  });
  return ret;
};

function buildMissingFieldsMessage(missingFieldNames: string[]): string {
  return `Invalid payload. The following fields are missing: ${missingFieldNames.join(', ')}`;
};

export default {
  checkMissingFields,
  buildMissingFieldsMessage,
}
