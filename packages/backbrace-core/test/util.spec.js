import * as util from '../src/util';

describe('util', function() {

    describe('uid', function() {
        it('should generate a unique id', function() {
            let id = util.uid(),
                uid = util.uid();
            expect(uid).toBe(id + 1);
        });
    });

    describe('format string', function() {
        it('should merge arguments', function() {
            expect(util.formatString('abc{0}', '123')).toBe('abc123');
            expect(util.formatString('abc{0}', 1)).toBe('abc1');
            expect(util.formatString('abc{0}', false)).toBe('abcfalse');
        });

        it('should merge multiple arguments', function() {
            expect(util.formatString('abc{0}{1}', '123', 2)).toBe('abc1232');
            expect(util.formatString('{1}abc{0}', 1, 2)).toBe('2abc1');
            expect(util.formatString('a{0}bc{1}', false, true)).toBe('afalsebctrue');
        });

        it('should not merge undefined variables', function() {
            let obj = { id: 1 };
            expect(util.formatString('abc{0}', obj.name)).toBe('abc');
        });
    });

});
