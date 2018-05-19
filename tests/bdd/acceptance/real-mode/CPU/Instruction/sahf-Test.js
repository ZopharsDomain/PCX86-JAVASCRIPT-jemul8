/**
 * jemul8 - JavaScript x86 Emulator
 * http://jemul8.com/
 *
 * Copyright 2013 jemul8.com (http://github.com/asmblah/jemul8)
 * Released under the MIT license
 * http://jemul8.com/MIT-LICENSE.txt
 */

/*global define */
define([
    "js/util",
    "tools/TestSystem"
], function (
    util,
    TestSystem
) {
    "use strict";

    describe("CPU 'sahf' (store ah in flags) instruction", function () {
        /*jshint bitwise: false */
        var registers,
            system,
            testSystem;

        beforeEach(function (done) {
            testSystem = new TestSystem();
            system = testSystem.getSystem();
            registers = system.getCPURegisters();

            testSystem.init().done(function () {
                done();
            });
        });

        afterEach(function () {
            system.stop();
            registers = null;
            system = null;
            testSystem = null;
        });

        util.each({
            "should only allow sf, zf, af, pf and cf to be set": {
                registers: {
                    ah: 0xff,
                    flags: 0
                },
                expectedRegisters: {
                    sf: 1,
                    zf: 1,
                    af: 1,
                    pf: 1,
                    cf: 1,
                    flags: parseInt("11010101", 2)
                }
            },
            "should only allow sf, zf, af, pf and cf to be cleared": {
                registers: {
                    ah: 0,
                    flags: 0xff
                },
                expectedRegisters: {
                    sf: 0,
                    zf: 0,
                    af: 0,
                    pf: 0,
                    cf: 0,
                    flags: parseInt("00101010", 2)
                }
            },
            "should leave high byte of flags untouched": {
                registers: {
                    ah: 0,
                    flags: 0xffff
                },
                expectedRegisters: {
                    sf: 0,
                    zf: 0,
                    af: 0,
                    pf: 0,
                    cf: 0,
                    flags: parseInt("1111111100101010", 2)
                }
            }
        }, function (scenario, description) {
            describe(description, function () {
                // Test in both modes so we check support for operand-size override prefix
                util.each([true, false], function (is32BitCodeSegment) {
                    describe("when code segment is " + (is32BitCodeSegment ? 32 : 16) + "-bit", function () {
                        beforeEach(function (done) {
                            var assembly = util.heredoc(function (/*<<<EOS
org 0x100
[BITS ${bits}]
sahf

hlt
EOS
*/) {}, {bits: is32BitCodeSegment ? 32 : 16});

                            testSystem.on("pre-run", function () {
                                registers.cs.set32BitMode(is32BitCodeSegment);
                            });

                            if (scenario.setup) {
                                scenario.setup(registers);
                            }

                            util.each(scenario.registers, function (value, register) {
                                registers[register].set(value);
                            });

                            util.each(scenario.memory, function (options) {
                                system.write(options);
                            });

                            testSystem.execute(assembly).done(function () {
                                done();
                            }).fail(function (exception) {
                                done(exception);
                            });
                        });

                        util.each(scenario.expectedRegisters, function (expectedValue, register) {
                            it("should set " + register + " correctly", function () {
                                expect(registers[register].get()).to.equal(expectedValue);
                            });
                        });
                    });
                });
            });
        });
    });
});
