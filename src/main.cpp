#include <iostream>
#include "jGraph.h"
 // if edit data/androsten/Androsten_forMult_analysis1.sdf 
 // cp data/androsten/Androsten_forMult_analysis1.sdf /Volumes/san256/users_for_mac_system_macPro/jeannerat/Dropbox/pourLucFull/androsten/
int main(int argc, char *argv[]) {
  // will read files in folders listed as argument 
  // if list is empty (argc == 1), will hard wired data below
  int numberOfFiles = argc - 1;
  if (argc == 1) numberOfFiles = 1; // even if no input file (argc == 1) will run the loop once
  for (int mainLoop = 0; mainLoop < numberOfFiles; mainLoop ++) {
    JGraph jGraph = JGraph();
    if (mainLoop == 0 && argc == 1) {
      cerr << "Using hard wired data" << endl;
      vector < double > Jvalues; // for unassigned J's
      Jvalues.push_back(7.0); // to test unassigned J
      Jvalues.push_back(1.0); // to test unassigned J
      Jvalues.push_back(5.0); // to test unassigned J
      jGraph.addColumn(5.3, Jvalues, "H1");
      Jvalues.clear();
      jGraph.addColumn(7.2, Jvalues, "H3");
      jGraph.addColumn(5.8, Jvalues, "H2");
      jGraph.addColumn(4.1, Jvalues, "a");
      jGraph.addColumn(4.2, Jvalues, "b");
      jGraph.addColumn(4.3, Jvalues, "c");
      jGraph.addColumn(4.4, Jvalues, "d");
      jGraph.addColumn(4.5, Jvalues, "e");

      jGraph.sortColumnByChemicalShift(); // don't sortColumn after addAssignedCoupling because it will mess the indices

      jGraph.addAssignedCoupling("H1", "H2", 5.3);
      jGraph.addAssignedCoupling("H2", "H3", 7.3);
      jGraph.addAssignedCoupling("H1", "H3", 11.3);
      jGraph.addAssignedCoupling("a", "b", 7.01);
      jGraph.addAssignedCoupling("a", "c", 7.01);
      jGraph.addAssignedCoupling("a", "d", 7.02);
      jGraph.addAssignedCoupling("a", "e", 7.03);
      jGraph.addAssignedCoupling("b", "c", 7.04);
      jGraph.addAssignedCoupling("b", "d", 7.05);
      jGraph.addAssignedCoupling("b", "e", 7.06);
      jGraph.addAssignedCoupling("c", "d", 7.07);
      jGraph.addAssignedCoupling("c", "e", 7.08);
      jGraph.addAssignedCoupling("d", "e", 7.09);
      jGraph.updateShiftedPositionsCouplings();
    } else { // read file...

    }

    cout << " I have " << jGraph.getSize() << " elements in jGraph" << endl;
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