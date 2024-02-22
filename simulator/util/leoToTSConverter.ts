import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const convertLeoToTs = async (filePath: string) => {
  console.log(`Converting Leo contract from: ${filePath}`);
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  // Define the output TypeScript file path
  const directoryPath = path.dirname(filePath);
  const parentDirectoryPath = path.dirname(directoryPath);
  const parentDirectoryName = path.basename(parentDirectoryPath);

  let tsCode = initLeoContract(parentDirectoryName);
  let collecting = false;
  let collectedLines: string[] = [];
  let nestedLevel = 0;
  let endBracketFound = false;
  for await (const line of rl) {
    const trimmedLine = line.trim();
    // Check if we're starting a record or struct
    if (trimmedLine.startsWith('record')
      || trimmedLine.startsWith('struct')
      || trimmedLine.startsWith('transition')
      || trimmedLine.startsWith('finalize')) {
      nestedLevel += (line.match(/\{/g) || []).length;
      const endBrackets = (line.match(/\}/g) || []).length;
      if (endBrackets > 0) {
        endBracketFound = true;
      }
      nestedLevel -= endBrackets;
      collecting = true;
      collectedLines.push(line);
    } else if (collecting) {
      collectedLines.push(line);
      // Check if we're ending a record or struct
      // Adjust brackets count based on the current line
      nestedLevel += (line.match(/\{/g) || []).length;
      const endBrackets = (line.match(/\}/g) || []).length;
      if (endBrackets > 0) {
        endBracketFound = true;
      }
      nestedLevel -= endBrackets;
      if (nestedLevel === 0 && endBracketFound) {
        tsCode = parseAndConvertBlock(collectedLines, tsCode);
        collecting = false;
        collectedLines = [];
        endBracketFound = false;
      }
    } else {
      // Each line in input.txt will be successively available here as `line`.
      tsCode = parseAndConvert(line, tsCode);
    }
  }

  tsCode = finishLeoContract(tsCode);
  
  const tsFilePath = path.join('./src/contracts', `${parentDirectoryName}.ts`);
  console.log(`TypeScript file will be saved to: ${tsFilePath}`);

  //Save the converted TypeScript class to a file
  fs.writeFile(tsFilePath, tsCode, err => {
    if (err) {
      console.error(`Error writing file: ${err}`);
    } else {
      console.log(`TypeScript file has been saved to ${tsFilePath}`);
    }
  });
}

const initLeoContract = (name: string) => {
  return `
// interfaces
export class ${name} {
  // params
  constructor(
    // constructor args
  ) {
    // constructor body
  }
  `;
}

const finishLeoContract = (tsLeo: string) => {
  return tsLeo + '\n}';
}

const parseAndConvert = (leoLine: string, tsCode: string) => {
  const trimmedLine = leoLine.trim();
  if (trimmedLine.startsWith('import')) {
    tsCode = convertImports(trimmedLine, tsCode);
  }

  if (trimmedLine.startsWith('//')) {
    tsCode += `${trimmedLine}\n`;
  }

  if (trimmedLine.startsWith('mapping')) {
    tsCode = convertMapping(trimmedLine, tsCode);
  }

  if (trimmedLine.startsWith('const')) {
    tsCode = convertConst(trimmedLine, tsCode);
  }
  // Implement the parsing and converting logic here
  // This is a placeholder for the actual conversion logic
  return tsCode;
}

const parseAndConvertBlock = (leoLines: string[], tsCode: string): string => {
  // Determine if it's a record or struct and extract the name
  const firstLine = leoLines[0].trim();
  if (firstLine.startsWith('record') || firstLine.startsWith('struct')) {
    console.log('Converting record/struct', leoLines[0]);
    tsCode = convertToInterface(leoLines, tsCode);
  } else if (firstLine.startsWith('transition')) {
    console.log('Converting transition', leoLines[0]);
    tsCode = convertTransition(leoLines, tsCode);
  } else {
    console.log('Missed this line:', firstLine);
  }
  return tsCode;
}

const TAB = '  ';

const convertType = (leoType: string): string => {
  switch (leoType) {
    case 'address':
      return 'string';
    case 'u8':
    case 'u32':
    case 'u64':
    case 'u128':
      return 'bigint';
    case 'field':
      return 'string';
    case 'bool':
      return 'boolean';
    default:
      return leoType; // Default fallback
  }
};

const convertValue = (leoValue: string, leoType: string): string => {
  switch (leoType) {
    case 'string':
      return `"${leoValue}"`;
    case 'bigint':
      return `BigInt(${leoValue})`;
    case 'boolean':
      return leoValue;
    default:
      return leoValue; // Default fallback
  }
};

const convertMapping = (leoLine: string, tsCode: string): string => {
  const mappingMatch = leoLine.match(/mapping\s+(\w+):\s+(\w+)\s+=>\s+(\w+);/);
  if (mappingMatch) {
    const [, name, keyType, valueType] = mappingMatch;
    // TypeScript doesn't have a direct equivalent of Leo's mapping, using Map for demonstration
    const lineToAdd = `${TAB}${name}: Map<${convertType(keyType)}, ${convertType(valueType)}> = new Map();\n`;
    return addToProperties(lineToAdd, tsCode);
  } else {
    return `// Error: Could not parse mapping: ${leoLine}\n`;
  }
}

const convertToInterface = (leoLines: string[], tsCode: string): string => {
  // Determine if it's a record or struct and extract the name
  const firstLine = leoLines[0].trim();
  let name = '';
  if (firstLine.startsWith('record')) {
    name = (firstLine.match(/record\s+(\w+)/))![1];
  } else if (firstLine.startsWith('struct')) {
    name = (firstLine.match(/struct\s+(\w+)/))![1];
  }

  let interaceCode = '';
  // Start TypeScript interface
  interaceCode += `interface ${name} {\n`;

  // Convert each field
  leoLines.slice(1, -1).forEach(line => { // Exclude the first and last line
    const [field, type] = line.trim().split(':').map(part => part.trim());
    interaceCode += `${TAB}${field}: ${convertType(type.replace(',', ''))};\n`; // Remove commas and convert types
  });

  // Close TypeScript interface
  interaceCode += '}\n';
  return addToInterfaces(interaceCode, tsCode);
}

const convertTransition = (leoLines: string[], tsCode: string): string => {
  const name = (leoLines[0].trim().match(/transition\s+(\w+)/))![1];
  let transitionTs = "";
  let argsString = "";
  let collectingArgs = true;
  let parenthesesCount = 0;
  leoLines.forEach(line => {
    if (collectingArgs) {
      // Adjust parentheses count based on the current line
      parenthesesCount += (line.match(/\(/g) || []).length;
      parenthesesCount -= (line.match(/\)/g) || []).length;

      // Collect arguments within parentheses
      if (line.includes('(') || line.includes(')')) {
        const lastIndex = line.indexOf(')') > 0 ? line.indexOf(')') : line.length;
        const argsPart = line.substring(line.indexOf('(') + 1, lastIndex);
        console.log('argsPart:', argsPart);
        argsString += argsPart;
      } else {
        argsString += line;
      }

      // If parentheses count reaches 0, we've collected all arguments
      if (parenthesesCount === 0) {
        collectingArgs = false;
        // Split arguments by comma and trim each argument
        const args = argsString.split(',').map(arg => arg.trim());
        const argsTS = convertArgs(args);
        transitionTs = `${TAB}${name}(\n${argsTS}${TAB}) {\n  }\n`;
      }
    }
  });
  return tsCode += transitionTs;
}

const convertArgs = (leoArgs: string[]): string => {
  return leoArgs.map(arg => {
    // Remove the 'private' or 'public' identifier and trim any leading/trailing whitespace
    const cleanArg = arg.replace(/(private|public)\s+/, '').trim();

    // Split the cleaned argument into name and type
    const [name, type] = cleanArg.split(':').map(part => part.trim());
    const tsType = convertType(type);

    return `${TAB}${TAB}${name}: ${tsType},\n`;
  }).join('');

}

const convertConst = (leoLine: string, tsCode: string): string => {
  const constantMatch = leoLine.match(/const\s+(\w+):\s+(\w+)\s+=\s+(.+);/);
  if (constantMatch) {
    const [, name, valueType, value] = constantMatch;
    const lineToAdd = `${TAB}static readonly ${name} = ${convertValue(value, convertType(valueType))};\n`;
    return addToProperties(lineToAdd, tsCode);
  } else {
    return `// Error: Could not parse constant: ${leoLine}\n`;
  }
}

const convertImports = (leoLine: string, tsCode: string): string => {
  const regex = /import\s+([^.]+)\.aleo/;
  const match = leoLine.match(regex);
  const programName = match ? match[1] : 'unknown';
  const tsProgramImport = `import { ${programName} } from './${programName}';\n`;
  tsCode = tsProgramImport + tsCode;
  const constructorKey = '// constructor args\n';
  const constructorLocationStart = tsCode.indexOf(constructorKey) + constructorKey.length;
  const tsProgramArg = `${TAB}${TAB}${programName}Contract: ${programName},\n`;
  tsCode = tsCode.slice(0, constructorLocationStart) + tsProgramArg + tsCode.slice(constructorLocationStart);
  const constructorBodyKey = '// constructor body\n';
  const constructorBodyLocation = tsCode.indexOf(constructorBodyKey) + constructorBodyKey.length;
  const tsProgramAssignment = `${TAB}${TAB}this.${programName} = ${programName}Contract;\n`;
  tsCode = tsCode.slice(0, constructorBodyLocation) + tsProgramAssignment + tsCode.slice(constructorBodyLocation);
  const propertyLine = `${TAB}${programName}: ${programName};\n`
  tsCode = addToProperties(propertyLine, tsCode);
  return tsCode;
}

const addToProperties = (lineToAdd: string, tsCode: string): string => {
  const propertyKey = '// params\n';
  const propertyLocation = tsCode.indexOf(propertyKey) + propertyKey.length;
  tsCode = tsCode.slice(0, propertyLocation) + lineToAdd + tsCode.slice(propertyLocation);
  return tsCode;
}

const addToInterfaces = (linesToAdd: string, tsCode: string): string => {
  const interfaceKey = '// interfaces\n';
  const interfaceLocation = tsCode.indexOf(interfaceKey) + interfaceKey.length;
  tsCode = tsCode.slice(0, interfaceLocation) + linesToAdd + tsCode.slice(interfaceLocation);
  return tsCode;
}

// Expected to be called with: node leoToTsConverter.js <path-to-leo-file>
const filePath = process.argv[2];
if (!filePath) {
  console.error('Please provide the path to the Leo contract file.');
  process.exit(1);
}

convertLeoToTs(filePath);
