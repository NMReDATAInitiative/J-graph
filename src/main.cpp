#include <iostream>
#include "jGraph.h"
// clang++ -fdiagnostics-color=always  -std=c++17 -stdlib=libc++  -g ../src/main.cpp ../src/jGraph.cpp -o ./main.out

 // ./main.out > ../html/androNew.csv; cat ../html/androNew.csv;
 // if edit data/androsten/Androsten_forMult_analysis1.sdf
 // cp data/androsten/Androsten_forMult_analysis1.sdf /Volumes/san256/users_for_mac_system_macPro/jeannerat/Dropbox/pourLucFull/androsten/
int main(int argc, char *argv[]) {
   std::srand(std::time(nullptr));
  // will read files in folders listed as argument
  // if list is empty (argc == 1), will hard wired data below
  int numberOfFiles = argc - 1;
  if (argc == 1) numberOfFiles = 1; // even if no input file (argc == 1) will run the loop once
  for (int mainLoop = 0; mainLoop < numberOfFiles; mainLoop ++) {
    JGraph jGraph = JGraph();
    if (mainLoop == 0 && argc == 1) {
            vector < double > Jvalues; // for unassigned J's

      /*
      cerr << "Using hard wired data" << endl;
      Jvalues.push_back(7.0); // to test unassigned J
      Jvalues.push_back(1.0); // to test unassigned J
      Jvalues.push_back(5.0); // to test unassigned J
      jGraph.addColumn(5.3, Jvalues, "H1");
      Jvalues.clear();
      jGraph.addColumn(3.8, Jvalues, "H3");
      jGraph.addColumn(5.8, Jvalues, "H2");
      jGraph.addColumn(4.1, Jvalues, "a");
      jGraph.addColumn(4.2, Jvalues, "b");
      jGraph.addColumn(4.3, Jvalues, "c");
      jGraph.addColumn(4.4, Jvalues, "d");
      jGraph.addColumn(4.5, Jvalues, "e");

  */

jGraph.addColumn("H20", 5.75 );
jGraph.addColumn("11ax", 1.45 );
jGraph.addColumn("11eq", 1.69 );
jGraph.addColumn("12ax", 1.27 );
jGraph.addColumn("12eq", 1.86 );
jGraph.addColumn("15ax", 1.57 );
jGraph.addColumn("15eq", 1.97 );
jGraph.addColumn("16ax", 2.10 );
jGraph.addColumn("16eq", 2.47 );
jGraph.addColumn("1ax", 1.71 );
jGraph.addColumn("1eq", 2.04 );
jGraph.addColumn("2ax", 2.4301 );
jGraph.addColumn("2eq", 2.35 );
jGraph.addColumn("6ax", 2.43 );
jGraph.addColumn("6eq", 2.33 );
jGraph.addColumn("7ax", 1.11 );
jGraph.addColumn("7eq", 1.9701 );
jGraph.addColumn("H14", 1.29 );
jGraph.addColumn("H8", 1.73);
jGraph.addColumn("H9", 0.99);
jGraph.addColumn("Hffff9", 0.98);

jGraph.sortColumnByChemicalShift(); // don't sortColumn after addAssignedCoupling because it will mess the indices

jGraph.addAssignedCoupling("H20", "6ax", 1.76);
jGraph.addAssignedCoupling("H9", "11ax", 12.51);
jGraph.addAssignedCoupling("H9", "7ax", 4.19);
jGraph.addAssignedCoupling("H9", "H8", 10.55);
jGraph.addAssignedCoupling("H14", "15ax", 12.76);
 jGraph.addAssignedCoupling("H14", "15eq", 5.91);
  jGraph.addAssignedCoupling("H14", "H8", 10.90);
   jGraph.addAssignedCoupling("12ax", "11ax", 13.44);
    jGraph.addAssignedCoupling("12ax", "6eq", 4.19);
jGraph.addAssignedCoupling("12ax", "12eq", 13.01);
jGraph.addAssignedCoupling("12ax", "11ax", 13.44);
 jGraph.addAssignedCoupling("12ax", "6eq", 4.19);
 jGraph.addAssignedCoupling("2ax", "12eq", 13.01);
 jGraph.addAssignedCoupling("15ax", "H14", 12.76);
jGraph.addAssignedCoupling("15ax", "15eq", -12.42);
jGraph.addAssignedCoupling("15ax", "16eq", 9.00);
jGraph.addAssignedCoupling("15ax", "16ax", 9.29);
jGraph.addAssignedCoupling("11ax", "H9", 12.51);
 jGraph.addAssignedCoupling("11ax", "12ax", 13.44);
  jGraph.addAssignedCoupling("11ax", "12eq", 4.04);
  jGraph.addAssignedCoupling("11ax", "11eq", 13.70);
   jGraph.addAssignedCoupling("15eq", "H14", 5.91);
   jGraph.addAssignedCoupling("15eq", "15ax", -12.42);
    jGraph.addAssignedCoupling("15eq", "16eq", 0.89);
 jGraph.addAssignedCoupling("15eq", "16ax", 9.07);
 jGraph.addAssignedCoupling("16eq", "15ax", 9.00);
 jGraph.addAssignedCoupling("16eq", "15eq", 0.89);
 jGraph.addAssignedCoupling("16eq", "16ax", 19.41);
 jGraph.addAssignedCoupling("7ax", "H9", 4.19);
 jGraph.addAssignedCoupling("7ax", "H8", 11.81);
jGraph.addAssignedCoupling("7ax", "6ax", 13.95);
 jGraph.addAssignedCoupling("7ax", "7eq", -12.85);
 jGraph.addAssignedCoupling("1eq", "2ax",5.16);
 jGraph.addAssignedCoupling("1eq", "2eq", 3.09);
 jGraph.addAssignedCoupling("1eq", "1ax", -13.39);
  jGraph.addAssignedCoupling("H8", "H9", 10.55);
 jGraph.addAssignedCoupling("H8", "H14", 10.90);
  jGraph.addAssignedCoupling("H8", "7ax", 11.81);
jGraph.addAssignedCoupling("H8", "7eq", 3.54);
jGraph.addAssignedCoupling("6ax", "20", 1.76);
jGraph.addAssignedCoupling("6ax", "7ax", 13.95);
jGraph.addAssignedCoupling("6ax", "6eq", -14.56);
jGraph.addAssignedCoupling("6ax", "7eq", 5.42);
 jGraph.addAssignedCoupling("2ax", "1eq", 5.16);
 jGraph.addAssignedCoupling("2ax", "2eq", 16.75);
 jGraph.addAssignedCoupling("2ax", "1ax", 14.96);
  jGraph.addAssignedCoupling("2eq", "1eq", 3.09);
 jGraph.addAssignedCoupling("2eq", "2ax", -16.75);
 jGraph.addAssignedCoupling("2eq", "1ax", 4.41);
 jGraph.addAssignedCoupling("6eq", "12ax", 4.19);
  jGraph.addAssignedCoupling("6eq", "6ax", -14.56);
  jGraph.addAssignedCoupling("6eq", "7eq", 2.45);
   jGraph.addAssignedCoupling("16ax", "15ax", 9.29);
 jGraph.addAssignedCoupling("16ax", "15eq", 9.07);
  jGraph.addAssignedCoupling("16ax", "16eq", 19.41);
jGraph.addAssignedCoupling("7eq", "7ax", -12.85);
jGraph.addAssignedCoupling("7eq", "H8", 3.54);
jGraph.addAssignedCoupling("7eq", "6ax", 5.42);
jGraph.addAssignedCoupling("7eq", "6eq", 2.45);
jGraph.addAssignedCoupling("12eq", "12ax", 13.01);
jGraph.addAssignedCoupling("12eq", "11ax", 4.04);
jGraph.addAssignedCoupling("12eq", "11eq", 2.74);
jGraph.addAssignedCoupling("1ax", "1eq", -13.39);
 jGraph.addAssignedCoupling("1ax", "2ax", 14.96);
  jGraph.addAssignedCoupling("1ax", "2eq", 4.41);
jGraph.addAssignedCoupling("11eq", "11ax", 13.70);
jGraph.addAssignedCoupling("11eq", "12eq", 2.74);
/*
      jGraph.addAssignedCoupling("H1", "H2", 5.3);
      jGraph.addAssignedCoupling("H2", "H3", 7.3);
      jGraph.addAssignedCoupling("H1", "H3", 11.3);
      jGraph.addAssignedCoupling("a", "b", 7.00);
      jGraph.addAssignedCoupling("a", "c", 7.01);
      jGraph.addAssignedCoupling("a", "d", 7.02);
      jGraph.addAssignedCoupling("a", "e", 7.03);
      jGraph.addAssignedCoupling("b", "c", 7.04);
      jGraph.addAssignedCoupling("b", "d", 7.05);
      jGraph.addAssignedCoupling("b", "e", 7.06);
      jGraph.addAssignedCoupling("c", "d", 7.07);
      jGraph.addAssignedCoupling("c", "e", 7.08);
      jGraph.addAssignedCoupling("d", "e", 7.09);
      */
      cout << "chemShift1,chemShift2,indexColumn1,indexColumn2,Jvalue,JvalueShifted,Label,labelColumn1,labelColumn2" << endl;
      jGraph.updateShiftedPositionsCouplings();
    } else { // read file...

    }

    for (size_t i = 0; i < jGraph.getSize(); i++) {
        cerr << i << " : " << jGraph.fColumns[i].label << " at " << jGraph.fColumns[i].chemicalShift << " ppm ";
        const size_t size = jGraph.fColumns[i].columnMembers.size();
        for (size_t j = 0; j < size; j++) {
          cerr <<  jGraph.fColumns[i].columnMembers[j].Jvalues << " ";
          if (jGraph.fColumns[i].columnMembers[j].hasPartnerIndex)
                  cerr << "(" << jGraph.fColumns[i].columnMembers[j].partnerIndex << ")";
          if (j == (size-  1)) cerr << " Hz "; else cerr << ", ";
        }
        cerr << endl;
    }
  }
  return 0;
}