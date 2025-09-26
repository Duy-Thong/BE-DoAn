const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
        '^.+\\.(ts)$': ['ts-jest', { tsconfig: 'tsconfig.json', useESM: true }],
    },
    extensionsToTreatAsEsm: ['.ts'],
};
export default config;
//# sourceMappingURL=jest.config.js.map