#include <iostream>
#include "jGraph.h"

int main() {
  JGraph jGraph = JGraph();
  vector < double > Jvalues; // for unassigned J's
  Jvalues.push_back(7.0); // to test unassigned J
  Jvalues.push_back(1.0); // to test unassigned J
  Jvalues.push_back(5.0); // to test unassigned J
  jGraph.addColumn(5.3, Jvalues, "H1");
  Jvalues.clear();
  jGraph.addColumn(7.2, Jvalues, "H3");
  jGraph.addColumn(5.8, Jvalues, "H2");
  jGraph.sortColumnByChemicalShift(); // dont sortColumn after addAssignedCoupling because it will mess the indices

  jGraph.addAssignedCoupling("H1", "H2", 5.3);
  jGraph.addAssignedCoupling("H2", "H3", 7.3);
  jGraph.addAssignedCoupling("H1", "H3", 11.3);
  jGraph.updateShiftedPositions();
  
  cout << " I have " << jGraph.getSize() << " elements in jGraph" << endl;
  for (size_t i = 0; i < jGraph.getSize(); i++) {
      cout << i << " : " << jGraph.fColumns[i].label << " at " << jGraph.fColumns[i].chemicalShift << " ppm ";
      const size_t size = jGraph.fColumns[i].columnMembers.size();
      for (size_t j = 0; j < size; j++) {
        cout <<  jGraph.fColumns[i].columnMembers[j].Jvalues << " ";
        if (jGraph.fColumns[i].columnMembers[j].hasPartnerIndex)
                cout << "(" << jGraph.fColumns[i].columnMembers[j].partnerIndex << ")";
        if (j == (size-  1)) cout << " Hz "; else cout << ", ";
      }
      cout << endl;
  }
  return 0;
}  